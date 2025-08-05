import { PaymentService } from '@/services/payment';
import { stripe } from '@/lib/stripe';

// Mock Stripe
jest.mock('@/lib/stripe', () => ({
  stripe: {
    paymentIntents: {
      create: jest.fn(),
      confirm: jest.fn(),
      retrieve: jest.fn(),
    },
    customers: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
    paymentMethods: {
      create: jest.fn(),
      attach: jest.fn(),
      list: jest.fn(),
    },
    refunds: {
      create: jest.fn(),
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

const mockStripe = stripe as jest.Mocked<typeof stripe>;

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
        amount: 2000,
        currency: 'usd',
        status: 'requires_payment_method',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as any);

      const result = await PaymentService.createPaymentIntent({
        amount: 20.00,
        currency: 'usd',
        orderId: 'order-123',
      });

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 2000, // Amount in cents
        currency: 'usd',
        confirmation_method: 'manual',
        confirm: false,
        metadata: {
          orderId: 'order-123',
        },
      });

      expect(result).toEqual({
        id: 'pi_test_123',
        clientSecret: 'pi_test_123_secret',
        amount: 2000,
        currency: 'usd',
        status: 'requires_payment_method',
      });
    });

    it('should create and confirm payment intent with payment method', async () => {
      const mockPaymentIntent = {
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
        amount: 2000,
        currency: 'usd',
        status: 'succeeded',
      };

      mockStripe.paymentIntents.create.mockResolvedValue(mockPaymentIntent as any);

      const result = await PaymentService.createPaymentIntent({
        amount: 20.00,
        currency: 'usd',
        orderId: 'order-123',
        paymentMethodId: 'pm_test_123',
      });

      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 2000,
        currency: 'usd',
        payment_method: 'pm_test_123',
        confirmation_method: 'manual',
        confirm: true,
        metadata: {
          orderId: 'order-123',
        },
      });
    });
  });

  describe('confirmPaymentIntent', () => {
    it('should confirm payment intent', async () => {
      const mockConfirmedIntent = {
        id: 'pi_test_123',
        status: 'succeeded',
      };

      mockStripe.paymentIntents.confirm.mockResolvedValue(mockConfirmedIntent as any);

      const result = await PaymentService.confirmPaymentIntent('pi_test_123', 'pm_test_123');

      expect(mockStripe.paymentIntents.confirm).toHaveBeenCalledWith('pi_test_123', {
        payment_method: 'pm_test_123',
      });

      expect(result).toEqual(mockConfirmedIntent);
    });
  });

  describe('createCustomer', () => {
    it('should create Stripe customer', async () => {
      const mockCustomer = {
        id: 'cus_test_123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockStripe.customers.create.mockResolvedValue(mockCustomer as any);

      const result = await PaymentService.createCustomer({
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        phone: undefined,
        metadata: undefined,
      });

      expect(result).toEqual(mockCustomer);
    });
  });

  describe('refundPayment', () => {
    it('should create refund', async () => {
      const mockRefund = {
        id: 're_test_123',
        amount: 1000,
        status: 'succeeded',
      };

      mockStripe.refunds.create.mockResolvedValue(mockRefund as any);

      const result = await PaymentService.refundPayment('pi_test_123', 10.00, 'requested_by_customer');

      expect(mockStripe.refunds.create).toHaveBeenCalledWith({
        payment_intent: 'pi_test_123',
        amount: 1000, // Amount in cents
        reason: 'requested_by_customer',
      });

      expect(result).toEqual(mockRefund);
    });
  });

  describe('calculateOrderAmount', () => {
    it('should calculate order amount correctly', async () => {
      const items = [
        { price: 10.00, quantity: 2 },
        { price: 5.00, quantity: 1 },
      ];

      const result = await PaymentService.calculateOrderAmount(items);

      // Subtotal: (10 * 2) + (5 * 1) = 25
      // Tax (8%): 25 * 0.08 = 2
      // Shipping: 5.99 (under $50)
      // Total: 25 + 2 + 5.99 = 32.99
      // In cents: 3299

      expect(result).toBe(3299);
    });

    it('should apply free shipping for orders over $50', async () => {
      const items = [
        { price: 30.00, quantity: 2 },
      ];

      const result = await PaymentService.calculateOrderAmount(items);

      // Subtotal: 30 * 2 = 60
      // Tax (8%): 60 * 0.08 = 4.8
      // Shipping: 0 (free over $50)
      // Total: 60 + 4.8 = 64.8
      // In cents: 6480

      expect(result).toBe(6480);
    });
  });

  describe('formatAmountForDisplay', () => {
    it('should format amount for display', () => {
      expect(PaymentService.formatAmountForDisplay(2000, 'usd')).toBe('$20.00');
      expect(PaymentService.formatAmountForDisplay(1050, 'usd')).toBe('$10.50');
    });
  });

  describe('formatAmountFromStripe', () => {
    it('should convert Stripe amount to decimal', () => {
      expect(PaymentService.formatAmountFromStripe(2000)).toBe(20.00);
      expect(PaymentService.formatAmountFromStripe(1050)).toBe(10.50);
    });
  });
});
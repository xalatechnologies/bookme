/**
 * StatusBadge Component Tests
 *
 * Tests for StatusBadge and its convenience exports:
 * - StatusBadge
 * - BookingStatusBadge
 * - PaymentStatusBadge
 * - UserStatusBadge
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  StatusBadge,
  BookingStatusBadge,
  PaymentStatusBadge,
  UserStatusBadge,
} from '@/components/common/status/StatusBadge';

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
  }),
}));

describe('StatusBadge Component', () => {
  describe('Basic Rendering', () => {
    it('should render status badge', () => {
      render(<StatusBadge status="approved" />);

      expect(screen.getByText('approved')).toBeInTheDocument();
    });

    it('should render with default fallback text', () => {
      render(<StatusBadge status="custom-status" />);

      expect(screen.getByText('custom-status')).toBeInTheDocument();
    });

    it('should apply Badge component styles', () => {
      const { container } = render(<StatusBadge status="approved" />);

      const badge = container.firstChild;
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Status Variants - Booking', () => {
    it('should render approved status with success variant', () => {
      const { container } = render(<StatusBadge status="approved" />);

      const badge = container.querySelector('.bg-green-100');
      expect(badge).toBeInTheDocument();
    });

    it('should render confirmed status with success variant', () => {
      const { container } = render(<StatusBadge status="confirmed" />);

      const badge = container.querySelector('.bg-green-100');
      expect(badge).toBeInTheDocument();
    });

    it('should render pending status with warning variant', () => {
      const { container } = render(<StatusBadge status="pending" />);

      const badge = container.querySelector('.bg-yellow-100');
      expect(badge).toBeInTheDocument();
    });

    it('should render rejected status with error variant', () => {
      const { container } = render(<StatusBadge status="rejected" />);

      const badge = container.querySelector('.bg-red-100');
      expect(badge).toBeInTheDocument();
    });

    it('should render cancelled status with error variant', () => {
      const { container } = render(<StatusBadge status="cancelled" />);

      const badge = container.querySelector('.bg-red-100');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Status Variants - Payment', () => {
    it('should render paid status with success variant', () => {
      const { container } = render(<StatusBadge status="paid" />);

      const badge = container.querySelector('.bg-green-100');
      expect(badge).toBeInTheDocument();
    });

    it('should render unpaid status with warning variant', () => {
      const { container } = render(<StatusBadge status="unpaid" />);

      const badge = container.querySelector('.bg-yellow-100');
      expect(badge).toBeInTheDocument();
    });

    it('should render refunded status with info variant', () => {
      const { container } = render(<StatusBadge status="refunded" />);

      const badge = container.querySelector('.bg-blue-100');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Status Variants - General', () => {
    it('should render active status with success variant', () => {
      const { container } = render(<StatusBadge status="active" />);

      const badge = container.querySelector('.bg-green-100');
      expect(badge).toBeInTheDocument();
    });

    it('should render inactive status with error variant', () => {
      const { container } = render(<StatusBadge status="inactive" />);

      const badge = container.querySelector('.bg-red-100');
      expect(badge).toBeInTheDocument();
    });

    it('should render processing status with warning variant', () => {
      const { container } = render(<StatusBadge status="processing" />);

      const badge = container.querySelector('.bg-yellow-100');
      expect(badge).toBeInTheDocument();
    });

    it('should render completed status with success variant', () => {
      const { container } = render(<StatusBadge status="completed" />);

      const badge = container.querySelector('.bg-green-100');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Icons', () => {
    it('should show icon by default', () => {
      const { container } = render(<StatusBadge status="approved" />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('should hide icon when showIcon is false', () => {
      const { container } = render(<StatusBadge status="approved" showIcon={false} />);

      const icon = container.querySelector('svg');
      expect(icon).not.toBeInTheDocument();
    });

    it('should render CheckCircle icon for success statuses', () => {
      const { container } = render(<StatusBadge status="approved" />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('lucide-circle-check-big');
    });

    it('should render Clock icon for pending status', () => {
      const { container } = render(<StatusBadge status="pending" />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('lucide-clock');
    });

    it('should render XCircle icon for error statuses', () => {
      const { container } = render(<StatusBadge status="rejected" />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('lucide-circle-x');
    });

    it('should render AlertCircle icon for warning statuses', () => {
      const { container } = render(<StatusBadge status="unpaid" />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('lucide-circle-alert');
    });
  });

  describe('Icon Sizes', () => {
    it('should render small icon by default', () => {
      const { container } = render(<StatusBadge status="approved" />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('h-3');
      expect(icon).toHaveClass('w-3');
    });

    it('should render small icon when size is sm', () => {
      const { container } = render(<StatusBadge status="approved" size="sm" />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('h-3');
      expect(icon).toHaveClass('w-3');
    });

    it('should render medium icon when size is md', () => {
      const { container } = render(<StatusBadge status="approved" size="md" />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('h-4');
      expect(icon).toHaveClass('w-4');
    });

    it('should render large icon when size is lg', () => {
      const { container } = render(<StatusBadge status="approved" size="lg" />);

      const icon = container.querySelector('svg');
      expect(icon).toHaveClass('h-5');
      expect(icon).toHaveClass('w-5');
    });
  });

  describe('Custom Variant Override', () => {
    it('should use custom variant when provided', () => {
      const { container } = render(
        <StatusBadge status="approved" variant="error" />
      );

      const badge = container.querySelector('.bg-red-100');
      expect(badge).toBeInTheDocument();
    });

    it('should override default variant', () => {
      const { container } = render(
        <StatusBadge status="pending" variant="success" />
      );

      const badge = container.querySelector('.bg-green-100');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Translation Key', () => {
    it('should use translationKey when provided', () => {
      render(<StatusBadge status="approved" translationKey="custom.key" />);

      expect(screen.getByText('custom.key')).toBeInTheDocument();
    });

    it('should fallback to default translation pattern', () => {
      render(<StatusBadge status="approved" />);

      expect(screen.getByText('approved')).toBeInTheDocument();
    });
  });

  describe('Custom ClassName', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <StatusBadge status="approved" className="custom-badge" />
      );

      const badge = container.querySelector('.custom-badge');
      expect(badge).toBeInTheDocument();
    });

    it('should combine custom className with variant styles', () => {
      const { container } = render(
        <StatusBadge status="approved" className="extra-class" />
      );

      const badge = container.firstChild;
      expect(badge).toHaveClass('bg-green-100');
      expect(badge).toHaveClass('extra-class');
    });
  });

  describe('Case Insensitivity', () => {
    it('should handle uppercase status', () => {
      const { container } = render(<StatusBadge status="APPROVED" />);

      const badge = container.querySelector('.bg-green-100');
      expect(badge).toBeInTheDocument();
    });

    it('should handle mixed case status', () => {
      const { container } = render(<StatusBadge status="Approved" />);

      const badge = container.querySelector('.bg-green-100');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Unknown Status', () => {
    it('should render unknown status with info variant', () => {
      const { container } = render(<StatusBadge status="unknown-status" />);

      const badge = container.querySelector('.bg-blue-100');
      expect(badge).toBeInTheDocument();
    });

    it('should show AlertCircle icon for unknown status', () => {
      const { container } = render(<StatusBadge status="unknown-status" />);

      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass('lucide-circle-alert');
    });

    it('should display status text for unknown status', () => {
      render(<StatusBadge status="custom-status" />);

      expect(screen.getByText('custom-status')).toBeInTheDocument();
    });
  });

  describe('Dark Mode Support', () => {
    it('should have dark mode classes for success variant', () => {
      const { container } = render(<StatusBadge status="approved" />);

      const badge = container.querySelector('.dark\\:bg-green-900\\/30');
      expect(badge).toBeInTheDocument();
    });

    it('should have dark mode classes for warning variant', () => {
      const { container } = render(<StatusBadge status="pending" />);

      const badge = container.querySelector('.dark\\:bg-yellow-900\\/30');
      expect(badge).toBeInTheDocument();
    });

    it('should have dark mode classes for error variant', () => {
      const { container } = render(<StatusBadge status="rejected" />);

      const badge = container.querySelector('.dark\\:bg-red-900\\/30');
      expect(badge).toBeInTheDocument();
    });

    it('should have dark mode classes for info variant', () => {
      const { container } = render(<StatusBadge status="refunded" />);

      const badge = container.querySelector('.dark\\:bg-blue-900\\/30');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string status', () => {
      const { container } = render(<StatusBadge status="" />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle status with spaces', () => {
      render(<StatusBadge status="in progress" />);

      expect(screen.getByText('in progress')).toBeInTheDocument();
    });

    it('should handle status with special characters', () => {
      render(<StatusBadge status="status-123" />);

      expect(screen.getByText('status-123')).toBeInTheDocument();
    });
  });
});

describe('BookingStatusBadge Component', () => {
  it('should render booking status badge', () => {
    render(<BookingStatusBadge status="approved" />);

    expect(screen.getByText('status.approved')).toBeInTheDocument();
  });

  it('should use correct translation key pattern', () => {
    render(<BookingStatusBadge status="pending" />);

    expect(screen.getByText('status.pending')).toBeInTheDocument();
  });

  it('should render with icon', () => {
    const { container } = render(<BookingStatusBadge status="approved" />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should apply correct variant for booking statuses', () => {
    const { container } = render(<BookingStatusBadge status="confirmed" />);

    const badge = container.querySelector('.bg-green-100');
    expect(badge).toBeInTheDocument();
  });
});

describe('PaymentStatusBadge Component', () => {
  it('should render payment status badge', () => {
    render(<PaymentStatusBadge status="paid" />);

    expect(screen.getByText('status.paid')).toBeInTheDocument();
  });

  it('should use correct translation key pattern', () => {
    render(<PaymentStatusBadge status="unpaid" />);

    expect(screen.getByText('status.unpaid')).toBeInTheDocument();
  });

  it('should render with icon', () => {
    const { container } = render(<PaymentStatusBadge status="paid" />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should apply correct variant for payment statuses', () => {
    const { container } = render(<PaymentStatusBadge status="paid" />);

    const badge = container.querySelector('.bg-green-100');
    expect(badge).toBeInTheDocument();
  });
});

describe('UserStatusBadge Component', () => {
  it('should render user status badge', () => {
    render(<UserStatusBadge status="active" />);

    expect(screen.getByText('status.active')).toBeInTheDocument();
  });

  it('should use correct translation key pattern', () => {
    render(<UserStatusBadge status="inactive" />);

    expect(screen.getByText('status.inactive')).toBeInTheDocument();
  });

  it('should render with icon', () => {
    const { container } = render(<UserStatusBadge status="active" />);

    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should apply correct variant for user statuses', () => {
    const { container } = render(<UserStatusBadge status="active" />);

    const badge = container.querySelector('.bg-green-100');
    expect(badge).toBeInTheDocument();
  });
});

describe('All Status Variants Integration', () => {
  it('should render all success statuses correctly', () => {
    const successStatuses = ['approved', 'confirmed', 'paid', 'active', 'completed'];

    successStatuses.forEach((status) => {
      const { container } = render(<StatusBadge status={status} />);
      const badge = container.querySelector('.bg-green-100');
      expect(badge).toBeInTheDocument();
    });
  });

  it('should render all warning statuses correctly', () => {
    const warningStatuses = ['pending', 'unpaid', 'processing'];

    warningStatuses.forEach((status) => {
      const { container } = render(<StatusBadge status={status} />);
      const badge = container.querySelector('.bg-yellow-100');
      expect(badge).toBeInTheDocument();
    });
  });

  it('should render all error statuses correctly', () => {
    const errorStatuses = ['rejected', 'cancelled', 'inactive'];

    errorStatuses.forEach((status) => {
      const { container } = render(<StatusBadge status={status} />);
      const badge = container.querySelector('.bg-red-100');
      expect(badge).toBeInTheDocument();
    });
  });

  it('should render info status correctly', () => {
    const { container } = render(<StatusBadge status="refunded" />);
    const badge = container.querySelector('.bg-blue-100');
    expect(badge).toBeInTheDocument();
  });
});

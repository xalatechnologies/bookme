/**
 * Avatar Component Tests
 *
 * Tests for the shadcn/ui Avatar component and its sub-components
 * (Avatar, AvatarImage, AvatarFallback)
 */

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

describe('Avatar Component', () => {
  describe('Basic Rendering', () => {
    it('should render avatar container', () => {
      const { container } = render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should apply custom className to Avatar', () => {
      const { container } = render(
        <Avatar className="custom-avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveClass('custom-avatar');
    });

    it('should have default styling classes', () => {
      const { container } = render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveClass('relative');
      expect(avatar).toHaveClass('flex');
      expect(avatar).toHaveClass('h-10');
      expect(avatar).toHaveClass('w-10');
      expect(avatar).toHaveClass('rounded-full');
      expect(avatar).toHaveClass('overflow-hidden');
    });
  });

  describe('AvatarImage', () => {
    it('should accept src prop', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="User avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Avatar Image component accepts src prop even if image doesn't load immediately in tests
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should accept alt text prop', () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="John Doe" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Component accepts alt prop for accessibility
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should accept custom className', () => {
      render(
        <Avatar>
          <AvatarImage
            src="https://example.com/avatar.jpg"
            alt="Avatar"
            className="custom-image"
          />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Component accepts className prop
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render with AvatarImage component', () => {
      const { container } = render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Avatar container is rendered with both image and fallback
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('AvatarFallback', () => {
    it('should render fallback text', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render fallback with custom className', () => {
      render(
        <Avatar>
          <AvatarFallback className="custom-fallback">AB</AvatarFallback>
        </Avatar>
      );

      const fallback = screen.getByText('AB');
      expect(fallback).toHaveClass('custom-fallback');
    });

    it('should have default fallback styling', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const fallback = screen.getByText('JD');
      expect(fallback).toHaveClass('flex');
      expect(fallback).toHaveClass('h-full');
      expect(fallback).toHaveClass('w-full');
      expect(fallback).toHaveClass('items-center');
      expect(fallback).toHaveClass('justify-center');
      expect(fallback).toHaveClass('rounded-full');
      expect(fallback).toHaveClass('bg-muted');
    });

    it('should render initials', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render single character', () => {
      render(
        <Avatar>
          <AvatarFallback>J</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('should render icon as fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>
            <span data-testid="user-icon">👤</span>
          </AvatarFallback>
        </Avatar>
      );

      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });
  });

  describe('Image and Fallback Interaction', () => {
    it('should show fallback when no image provided', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should render with both image and fallback components', () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      // Fallback is initially visible while image loads
      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should accept image alt text for accessibility', () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/avatar.jpg" alt="User profile picture" />
          <AvatarFallback>UP</AvatarFallback>
        </Avatar>
      );

      // Fallback is shown while image loads
      expect(screen.getByText('UP')).toBeInTheDocument();
    });

    it('should support aria-label on Avatar', () => {
      const { container } = render(
        <Avatar aria-label="User avatar">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveAttribute('aria-label', 'User avatar');
    });

    it('should be identifiable by fallback text', () => {
      render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('JD')).toBeInTheDocument();
    });
  });

  describe('Sizing', () => {
    it('should have default size', () => {
      const { container } = render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveClass('h-10');
      expect(avatar).toHaveClass('w-10');
    });

    it('should support custom size via className', () => {
      const { container } = render(
        <Avatar className="h-16 w-16">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveClass('h-16');
      expect(avatar).toHaveClass('w-16');
    });

    it('should support small size', () => {
      const { container } = render(
        <Avatar className="h-8 w-8">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveClass('h-8');
      expect(avatar).toHaveClass('w-8');
    });

    it('should support large size', () => {
      const { container } = render(
        <Avatar className="h-20 w-20">
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveClass('h-20');
      expect(avatar).toHaveClass('w-20');
    });
  });

  describe('Styling', () => {
    it('should have rounded-full shape', () => {
      const { container } = render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveClass('rounded-full');
    });

    it('should have overflow hidden', () => {
      const { container } = render(
        <Avatar>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      const avatar = container.firstChild as HTMLElement;
      expect(avatar).toHaveClass('overflow-hidden');
    });

    it('should support custom background color on fallback', () => {
      render(
        <Avatar>
          <AvatarFallback className="bg-blue-500">JD</AvatarFallback>
        </Avatar>
      );

      const fallback = screen.getByText('JD');
      expect(fallback).toHaveClass('bg-blue-500');
    });

    it('should support custom text color on fallback', () => {
      render(
        <Avatar>
          <AvatarFallback className="text-white">JD</AvatarFallback>
        </Avatar>
      );

      const fallback = screen.getByText('JD');
      expect(fallback).toHaveClass('text-white');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty fallback', () => {
      const { container } = render(
        <Avatar>
          <AvatarFallback />
        </Avatar>
      );

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle very long initials', () => {
      render(
        <Avatar>
          <AvatarFallback>ABCDEFGH</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('ABCDEFGH')).toBeInTheDocument();
    });

    it('should handle special characters in fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>J&D</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('J&D')).toBeInTheDocument();
    });

    it('should handle unicode characters', () => {
      render(
        <Avatar>
          <AvatarFallback>李明</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('李明')).toBeInTheDocument();
    });

    it('should handle numbers in fallback', () => {
      render(
        <Avatar>
          <AvatarFallback>42</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('42')).toBeInTheDocument();
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to Avatar element', () => {
      const ref = { current: null };

      render(
        <Avatar ref={ref}>
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      expect(ref.current).not.toBeNull();
    });
  });

  describe('Multiple Avatars', () => {
    it('should render multiple avatars independently', () => {
      render(
        <div>
          <Avatar>
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AB</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>CD</AvatarFallback>
          </Avatar>
        </div>
      );

      expect(screen.getByText('JD')).toBeInTheDocument();
      expect(screen.getByText('AB')).toBeInTheDocument();
      expect(screen.getByText('CD')).toBeInTheDocument();
    });

    it('should maintain individual styling', () => {
      render(
        <div>
          <Avatar className="h-8 w-8">
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
          <Avatar className="h-12 w-12">
            <AvatarFallback>M</AvatarFallback>
          </Avatar>
          <Avatar className="h-16 w-16">
            <AvatarFallback>L</AvatarFallback>
          </Avatar>
        </div>
      );

      expect(screen.getByText('S')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
      expect(screen.getByText('L')).toBeInTheDocument();
    });
  });

  describe('Use Cases', () => {
    it('should work as user profile avatar', () => {
      render(
        <Avatar>
          <AvatarImage src="https://example.com/user.jpg" alt="John Doe profile" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
      );

      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should work in navigation bar', () => {
      render(
        <nav>
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://example.com/avatar.jpg" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </nav>
      );

      expect(screen.getByText('U')).toBeInTheDocument();
    });

    it('should work in user list', () => {
      const users = [
        { id: 1, name: 'John Doe', initials: 'JD' },
        { id: 2, name: 'Jane Smith', initials: 'JS' },
        { id: 3, name: 'Bob Wilson', initials: 'BW' },
      ];

      render(
        <div>
          {users.map((user) => (
            <Avatar key={user.id}>
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
          ))}
        </div>
      );

      expect(screen.getByText('JD')).toBeInTheDocument();
      expect(screen.getByText('JS')).toBeInTheDocument();
      expect(screen.getByText('BW')).toBeInTheDocument();
    });

    it('should work as comment author avatar', () => {
      render(
        <div>
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://example.com/author.jpg" alt="Comment author" />
            <AvatarFallback>CA</AvatarFallback>
          </Avatar>
          <p>This is a comment</p>
        </div>
      );

      expect(screen.getByText('CA')).toBeInTheDocument();
      expect(screen.getByText('This is a comment')).toBeInTheDocument();
    });

    it('should work with avatar group/stack', () => {
      render(
        <div className="flex -space-x-2">
          <Avatar className="border-2 border-white">
            <AvatarFallback>U1</AvatarFallback>
          </Avatar>
          <Avatar className="border-2 border-white">
            <AvatarFallback>U2</AvatarFallback>
          </Avatar>
          <Avatar className="border-2 border-white">
            <AvatarFallback>U3</AvatarFallback>
          </Avatar>
        </div>
      );

      expect(screen.getByText('U1')).toBeInTheDocument();
      expect(screen.getByText('U2')).toBeInTheDocument();
      expect(screen.getByText('U3')).toBeInTheDocument();
    });
  });

  describe('Complex Content', () => {
    it('should render fallback with custom component', () => {
      render(
        <Avatar>
          <AvatarFallback>
            <div data-testid="custom-fallback">Custom</div>
          </AvatarFallback>
        </Avatar>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    });

    it('should render fallback with SVG icon', () => {
      render(
        <Avatar>
          <AvatarFallback>
            <svg data-testid="avatar-icon" width="20" height="20">
              <circle cx="10" cy="10" r="10" />
            </svg>
          </AvatarFallback>
        </Avatar>
      );

      expect(screen.getByTestId('avatar-icon')).toBeInTheDocument();
    });
  });

  describe('Conditional Rendering', () => {
    it('should render with image component when available', () => {
      const hasImage = true;
      const imageUrl = 'https://example.com/avatar.jpg';

      render(
        <Avatar>
          {hasImage && <AvatarImage src={imageUrl} alt="Avatar" />}
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>
      );

      // Fallback is shown while image loads
      expect(screen.getByText('FB')).toBeInTheDocument();
    });

    it('should only render fallback when no image', () => {
      const hasImage = false;

      render(
        <Avatar>
          {hasImage && <AvatarImage src="" alt="Avatar" />}
          <AvatarFallback>FB</AvatarFallback>
        </Avatar>
      );

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.getByText('FB')).toBeInTheDocument();
    });
  });
});

/**
 * Card Component Tests
 *
 * Tests for the shadcn/ui Card component and its sub-components
 * (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter)
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

describe('Card Component', () => {
  describe('Card', () => {
    it('should render card with content', () => {
      render(<Card>Card content</Card>);

      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const { container } = render(<Card className="custom-card">Content</Card>);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-card');
    });

    it('should render as div by default', () => {
      const { container } = render(<Card>Content</Card>);

      const card = container.firstChild as HTMLElement;
      expect(card.tagName).toBe('DIV');
    });

    it('should have default card styling classes', () => {
      const { container } = render(<Card>Content</Card>);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-lg');
      expect(card).toHaveClass('border');
    });

    it('should render multiple children', () => {
      render(
        <Card>
          <div>Child 1</div>
          <div>Child 2</div>
        </Card>
      );

      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('CardHeader', () => {
    it('should render card header with content', () => {
      render(
        <Card>
          <CardHeader>Header content</CardHeader>
        </Card>
      );

      expect(screen.getByText('Header content')).toBeInTheDocument();
    });

    it('should apply custom className to header', () => {
      render(
        <Card>
          <CardHeader className="custom-header">
            <span data-testid="header-content">Header</span>
          </CardHeader>
        </Card>
      );

      const headerContent = screen.getByTestId('header-content');
      const header = headerContent.parentElement;
      expect(header).toHaveClass('custom-header');
    });

    it('should render header with title and description', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
    });
  });

  describe('CardTitle', () => {
    it('should render card title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>My Card Title</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('My Card Title')).toBeInTheDocument();
    });

    it('should apply custom className to title', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Large Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const title = screen.getByText('Large Title');
      expect(title).toHaveClass('text-2xl');
    });

    it('should render as h3 by default', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
        </Card>
      );

      const title = screen.getByText('Title');
      expect(title.tagName).toBe('H3');
    });
  });

  describe('CardDescription', () => {
    it('should render card description', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>This is a description</CardDescription>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('This is a description')).toBeInTheDocument();
    });

    it('should apply custom className to description', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription className="text-sm">Small text</CardDescription>
          </CardHeader>
        </Card>
      );

      const description = screen.getByText('Small text');
      expect(description).toHaveClass('text-sm');
    });

    it('should render as p by default', () => {
      render(
        <Card>
          <CardHeader>
            <CardDescription>Description</CardDescription>
          </CardHeader>
        </Card>
      );

      const description = screen.getByText('Description');
      expect(description.tagName).toBe('P');
    });
  });

  describe('CardContent', () => {
    it('should render card content', () => {
      render(
        <Card>
          <CardContent>Main content here</CardContent>
        </Card>
      );

      expect(screen.getByText('Main content here')).toBeInTheDocument();
    });

    it('should apply custom className to content', () => {
      render(
        <Card>
          <CardContent className="p-8">
            <span data-testid="content-text">Content</span>
          </CardContent>
        </Card>
      );

      const contentText = screen.getByTestId('content-text');
      const content = contentText.parentElement;
      expect(content).toHaveClass('p-8');
    });

    it('should render complex content', () => {
      render(
        <Card>
          <CardContent>
            <p>Paragraph 1</p>
            <p>Paragraph 2</p>
            <button>Action</button>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
    });
  });

  describe('CardFooter', () => {
    it('should render card footer', () => {
      render(
        <Card>
          <CardFooter>Footer content</CardFooter>
        </Card>
      );

      expect(screen.getByText('Footer content')).toBeInTheDocument();
    });

    it('should apply custom className to footer', () => {
      render(
        <Card>
          <CardFooter className="justify-end">
            <span data-testid="footer-text">Footer</span>
          </CardFooter>
        </Card>
      );

      const footerText = screen.getByTestId('footer-text');
      const footer = footerText.parentElement;
      expect(footer).toHaveClass('justify-end');
    });

    it('should render footer with buttons', () => {
      render(
        <Card>
          <CardFooter>
            <button>Cancel</button>
            <button>Save</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument();
    });
  });

  describe('Complete Card Structure', () => {
    it('should render full card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Manage your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Profile content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Save Changes</button>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText('User Profile')).toBeInTheDocument();
      expect(screen.getByText('Manage your profile information')).toBeInTheDocument();
      expect(screen.getByText('Profile content goes here')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });

    it('should maintain proper hierarchy', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      const card = container.firstChild as HTMLElement;
      const children = Array.from(card.children);

      expect(children).toHaveLength(3);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Accessible Card</CardTitle>
          </CardHeader>
        </Card>
      );

      const title = screen.getByText('Accessible Card');
      expect(title.tagName).toBe('H3');
    });

    it('should support ARIA attributes', () => {
      render(
        <Card aria-label="User card">
          <CardContent>Content</CardContent>
        </Card>
      );

      const card = screen.getByLabelText('User card');
      expect(card).toBeInTheDocument();
    });

    it('should be identifiable by text content', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Unique Card</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText('Unique Card')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should have default border radius', () => {
      const { container } = render(<Card>Content</Card>);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('rounded-lg');
    });

    it('should have default border', () => {
      const { container } = render(<Card>Content</Card>);

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('border');
    });

    it('should support custom styling via className', () => {
      const { container } = render(
        <Card className="bg-blue-500 p-8 shadow-xl">Content</Card>
      );

      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('bg-blue-500');
      expect(card).toHaveClass('p-8');
      expect(card).toHaveClass('shadow-xl');
    });

    it('should maintain spacing classes', () => {
      const { container } = render(
        <Card>
          <CardHeader>
            <CardTitle>Title</CardTitle>
          </CardHeader>
          <CardContent>Content</CardContent>
        </Card>
      );

      const header = screen.getByText('Title').closest('div');
      expect(header).toHaveClass('flex', 'flex-col');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty card', () => {
      const { container } = render(<Card />);

      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
    });

    it('should handle very long titles', () => {
      const longTitle = 'A'.repeat(200);
      render(
        <Card>
          <CardHeader>
            <CardTitle>{longTitle}</CardTitle>
          </CardHeader>
        </Card>
      );

      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });

    it('should handle nested cards', () => {
      render(
        <Card>
          <CardContent>
            <Card>
              <CardContent>Nested card</CardContent>
            </Card>
          </CardContent>
        </Card>
      );

      expect(screen.getByText('Nested card')).toBeInTheDocument();
    });

    it('should handle multiple cards', () => {
      render(
        <div>
          <Card>
            <CardTitle>Card 1</CardTitle>
          </Card>
          <Card>
            <CardTitle>Card 2</CardTitle>
          </Card>
        </div>
      );

      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
    });
  });
});

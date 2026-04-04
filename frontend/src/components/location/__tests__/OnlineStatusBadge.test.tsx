import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OnlineStatusBadge } from '../OnlineStatusBadge';

describe('OnlineStatusBadge', () => {
  it('renders online indicator when recently seen', () => {
    const justNow = new Date().toISOString();
    const { container } = render(<OnlineStatusBadge lastSeenAt={justNow} showLabel />);
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument();
  });

  it('renders offline indicator with time when lastSeenAt is older than 5 minutes', () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { container } = render(<OnlineStatusBadge lastSeenAt={tenMinutesAgo} showLabel />);
    expect(screen.getByText('10m ago')).toBeInTheDocument();
    expect(container.querySelector('.bg-gray-400')).toBeInTheDocument();
  });

  it('renders offline indicator when no lastSeenAt provided', () => {
    const { container } = render(<OnlineStatusBadge showLabel />);
    expect(screen.getByText('Never')).toBeInTheDocument();
    expect(container.querySelector('.bg-gray-400')).toBeInTheDocument();
  });

  it('shows only the dot without label when showLabel is false', () => {
    const justNow = new Date().toISOString();
    const { container } = render(<OnlineStatusBadge lastSeenAt={justNow} />);
    expect(container.querySelector('.bg-green-500')).toBeInTheDocument();
    expect(screen.queryByText('Online')).not.toBeInTheDocument();
  });

  it('shows hours ago for older timestamps', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    render(<OnlineStatusBadge lastSeenAt={twoHoursAgo} showLabel />);
    expect(screen.getByText('2h ago')).toBeInTheDocument();
  });

  it('shows days ago for very old timestamps', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    render(<OnlineStatusBadge lastSeenAt={twoDaysAgo} showLabel />);
    expect(screen.getByText('2d ago')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(<OnlineStatusBadge className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

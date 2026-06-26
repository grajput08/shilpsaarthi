import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ArtisanStatusBadge, DecisionBadge, DocStatusBadge } from './badges';

describe('badges', () => {
  it('renders a human label for an artisan status', () => {
    render(<ArtisanStatusBadge status="verified" />);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('renders market ready label', () => {
    render(<ArtisanStatusBadge status="market_ready" />);
    expect(screen.getByText('Market Ready')).toBeInTheDocument();
  });

  it('renders a fallback for a missing decision', () => {
    render(<DecisionBadge decision={null} />);
    expect(screen.getByText('No decision')).toBeInTheDocument();
  });

  it('renders a document status label', () => {
    render(<DocStatusBadge status="not_available" />);
    expect(screen.getByText('Not Available')).toBeInTheDocument();
  });
});

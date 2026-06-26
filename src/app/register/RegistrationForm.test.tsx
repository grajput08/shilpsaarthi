import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RegistrationForm from './RegistrationForm';

describe('RegistrationForm', () => {
  it('renders the language step first', () => {
    render(<RegistrationForm initialLanguage="en" />);
    expect(screen.getByText('Artisan Registration')).toBeInTheDocument();
    expect(screen.getByText('1/7')).toBeInTheDocument();
    expect(screen.getByTestId('reg-language')).toBeInTheDocument();
  });

  it('blocks progress past consent until the box is checked', () => {
    render(<RegistrationForm initialLanguage="en" />);
    // language -> consent
    fireEvent.click(screen.getByTestId('reg-next'));
    expect(screen.getByText('Consent & Information Notice')).toBeInTheDocument();
    // try to continue without consent
    fireEvent.click(screen.getByTestId('reg-next'));
    expect(screen.getByTestId('reg-error')).toHaveTextContent('Please accept the consent');
    // accept consent then continue
    fireEvent.click(screen.getByTestId('reg-consent'));
    fireEvent.click(screen.getByTestId('reg-next'));
    expect(screen.getByTestId('reg-name')).toBeInTheDocument();
  });
});

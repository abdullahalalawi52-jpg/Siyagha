import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomSelect from './CustomSelect';

vi.mock('motion/react', () => {
  return {
    motion: {
      div: React.forwardRef(({ children, initial, animate, exit, transition, ...props }: any, ref: any) => (
        <div ref={ref} {...props}>{children}</div>
      )),
    },
    AnimatePresence: ({ children }: any) => <>{children}</>,
  };
});

describe('CustomSelect Component', () => {
  const options = [
    { label: 'Option A', value: 'a' },
    { label: 'Option B', value: 'b' },
    { label: 'Option C', value: 'c' },
  ];

  it('renders correctly with the selected option label', () => {
    const onChange = vi.fn();
    render(<CustomSelect label="اختبار القائمة" options={options} value="a" onChange={onChange} />);
    
    // Label is rendered
    expect(screen.getByText('اختبار القائمة')).toBeInTheDocument();
    
    // Current selected option is displayed in the button
    expect(screen.getByRole('button', { name: /Option A/i })).toBeInTheDocument();
    // Other options are not visible initially
    expect(screen.queryByRole('button', { name: /Option B/i })).not.toBeInTheDocument();
  });

  it('toggles option dropdown on click', async () => {
    const onChange = vi.fn();
    render(<CustomSelect options={options} value="a" onChange={onChange} />);
    
    const trigger = screen.getByRole('button');
    
    // Click to open
    fireEvent.click(trigger);
    expect(screen.getByRole('button', { name: /Option B/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Option C/i })).toBeInTheDocument();
    
    // Click to close
    fireEvent.click(trigger);
    expect(screen.queryByRole('button', { name: /Option B/i })).not.toBeInTheDocument();
  });

  it('calls onChange when an option is clicked', () => {
    const onChange = vi.fn();
    render(<CustomSelect options={options} value="a" onChange={onChange} />);
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    
    const optionB = screen.getByRole('button', { name: /Option B/i });
    fireEvent.click(optionB);
    
    expect(onChange).toHaveBeenCalledWith('b');
    // Dropdown should be closed after selection
    expect(screen.queryByRole('button', { name: /Option B/i })).not.toBeInTheDocument();
  });

  it('dismisses dropdown when clicking outside', () => {
    const onChange = vi.fn();
    render(
      <div>
        <div data-testid="outside">Outside Click Area</div>
        <CustomSelect options={options} value="a" onChange={onChange} />
      </div>
    );
    
    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);
    expect(screen.getByRole('button', { name: /Option B/i })).toBeInTheDocument();
    
    // Simulate mousedown outside
    fireEvent.mouseDown(screen.getByTestId('outside'));
    
    expect(screen.queryByRole('button', { name: /Option B/i })).not.toBeInTheDocument();
  });
});

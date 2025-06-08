import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PromptInput from "../PromptInput";

describe("PromptInput Component", () => {
  const mockSetPrompt = vi.fn();
  const mockSetTool = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockSetPrompt.mockClear();
    mockSetTool.mockClear();
    mockOnSubmit.mockClear();
  });

  it("renders textarea and updates prompt on change", () => {
    render(
      <PromptInput
        prompt=""
        setPrompt={mockSetPrompt}
        tool="calculator"
        setTool={mockSetTool}
        onSubmit={mockOnSubmit}
        loading={false}
        isTyping={false}
        
      />
    );

    const textarea = screen.getByLabelText(/prompt input/i);
    fireEvent.change(textarea, { target: { value: "Hello World" } });

    expect(mockSetPrompt).toHaveBeenCalledWith("Hello World");
  });

  it("calls onSubmit when submit button clicked", () => {
    render(
      <PromptInput
        prompt="test"
        setPrompt={mockSetPrompt}
        tool="calculator"
        setTool={mockSetTool}
        onSubmit={mockOnSubmit}
        loading={false}
        isTyping={false}
      />
    );

    const button = screen.getByRole("button", { name: /send/i });
    fireEvent.click(button);

    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it("disables submit button when loading is true", () => {
    render(
      <PromptInput
        prompt="test"
        setPrompt={mockSetPrompt}
        tool="calculator"
        setTool={mockSetTool}
        onSubmit={mockOnSubmit}
        loading={true}
        isTyping={false}
      />
    );

    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("disables submit button when prompt is empty", () => {
    render(
      <PromptInput
        prompt=""
        setPrompt={mockSetPrompt}
        tool="calculator"
        setTool={mockSetTool}
        onSubmit={mockOnSubmit}
        loading={false}
        isTyping={false}
      />
    );

    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});

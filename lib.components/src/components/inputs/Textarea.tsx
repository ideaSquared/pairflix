import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import styled from 'styled-components';

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	/** Label for the textarea */
	label?: string;
	/** Error message to display */
	error?: string;
	/** Success message to display */
	success?: string;
	/** Whether to show character count */
	showCharacterCount?: boolean;
	/** Maximum character limit */
	maxLength?: number;
	/** Whether textarea should auto-grow */
	autoGrow?: boolean;
	/** Maximum height for auto-grow (in pixels) */
	maxHeight?: number;
	/** Help text to display below the textarea */
	helpText?: string;
}

const StyledTextareaWrapper = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	width: 100%;
`;

const StyledLabel = styled.label`
	font-size: 0.875rem;
	font-weight: 500;
	color: ${({ theme }) => theme.colors.text.primary};
`;

const StyledTextarea = styled.textarea<{
	hasError?: boolean;
	hasSuccess?: boolean;
}>`
	width: 100%;
	min-height: 100px;
	padding: 0.75rem;
	border: 1px solid
		${({ theme, hasError, hasSuccess }) =>
			hasError
				? theme.colors.error
				: hasSuccess
				? theme.colors.success
				: theme.colors.border};
	border-radius: ${({ theme }) => theme.borderRadius.md};
	font-size: 1rem;
	line-height: 1.5;
	color: ${({ theme }) => theme.colors.text.primary};
	background-color: ${({ theme }) => theme.colors.background.primary};
	transition: border-color 0.2s ease;
	resize: vertical;

	&:focus {
		outline: none;
		border-color: ${({ theme }) => theme.colors.primary};
		box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
	}

	&:disabled {
		background-color: ${({ theme }) => theme.colors.background.disabled};
		cursor: not-allowed;
	}
`;

const MessageText = styled.span<{ type: 'error' | 'success' | 'help' }>`
	font-size: 0.75rem;
	color: ${({ theme, type }) =>
		type === 'error'
			? theme.colors.error
			: type === 'success'
			? theme.colors.success
			: theme.colors.text.secondary};
`;

const CharacterCount = styled.span`
	font-size: 0.75rem;
	color: ${({ theme }) => theme.colors.text.secondary};
	align-self: flex-end;
`;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
	(
		{
			label,
			error,
			success,
			showCharacterCount,
			maxLength,
			autoGrow,
			maxHeight = 400,
			helpText,
			id,
			value,
			defaultValue,
			onChange,
			...props
		},
		ref
	) => {
		const [charCount, setCharCount] = useState(0);
		const textareaRef = useRef<HTMLTextAreaElement>(null);

		// Use useImperativeHandle to properly forward the ref
		useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

		useEffect(() => {
			const updateCharCount = () => {
				if (textareaRef.current) {
					setCharCount(textareaRef.current.value.length);
				}
			};
			updateCharCount();
		}, [value, defaultValue]);

		useEffect(() => {
			if (autoGrow && textareaRef.current) {
				const adjustHeight = () => {
					const textarea = textareaRef.current!;
					textarea.style.height = 'auto';
					const newHeight = Math.min(textarea.scrollHeight, maxHeight);
					textarea.style.height = `${newHeight}px`;
				};

				adjustHeight();
				textareaRef.current.addEventListener('input', adjustHeight);
				return () => {
					textareaRef.current?.removeEventListener('input', adjustHeight);
				};
			}
		}, [autoGrow, maxHeight]);

		const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setCharCount(e.target.value.length);
			onChange?.(e);
		};

		const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

		return (
			<StyledTextareaWrapper>
				{label && <StyledLabel htmlFor={textareaId}>{label}</StyledLabel>}
				<StyledTextarea
					ref={textareaRef}
					id={textareaId}
					hasError={!!error}
					hasSuccess={!!success}
					maxLength={maxLength}
					onChange={handleChange}
					aria-invalid={!!error}
					aria-describedby={`${textareaId}-message`}
					value={value}
					defaultValue={defaultValue}
					{...props}
				/>
				{(error || success || helpText) && (
					<MessageText
						id={`${textareaId}-message`}
						type={error ? 'error' : success ? 'success' : 'help'}
					>
						{error || success || helpText}
					</MessageText>
				)}
				{showCharacterCount && (
					<CharacterCount>
						{charCount}
						{maxLength ? ` / ${maxLength}` : ''} characters
					</CharacterCount>
				)}
			</StyledTextareaWrapper>
		);
	}
);

Textarea.displayName = 'Textarea';

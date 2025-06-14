import { Button, Input, TextArea } from '@pairflix/components';
import React, { useState } from 'react';
import type { CreateRelationshipRequest } from '../../../types/group';

interface CreateRelationshipFormProps {
  onSubmit: (data: CreateRelationshipRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function CreateRelationshipForm({
  onSubmit,
  onCancel,
  loading = false,
}: CreateRelationshipFormProps) {
  const [formData, setFormData] = useState<CreateRelationshipRequest>({
    partner_email: '',
    group_name: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.partner_email.trim()) {
      newErrors.partner_email = 'Partner email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.partner_email)) {
      newErrors.partner_email = 'Please enter a valid email address';
    }

    if (!formData.group_name.trim()) {
      newErrors.group_name = 'Relationship name is required';
    } else if (formData.group_name.trim().length < 2) {
      newErrors.group_name = 'Relationship name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        partner_email: formData.partner_email.trim(),
        group_name: formData.group_name.trim(),
        description: formData.description?.trim() || undefined,
      });
    } catch {
      // Error handling is managed by the parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Partner's Email *
          </label>
          <Input
            type="email"
            name="partner_email"
            value={formData.partner_email}
            onChange={handleInputChange}
            placeholder="Enter your partner's email address"
            error={errors.partner_email}
            disabled={loading}
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500">
            Your partner will receive an invitation to join this relationship
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Relationship Name *
          </label>
          <Input
            type="text"
            name="group_name"
            value={formData.group_name}
            onChange={handleInputChange}
            placeholder="e.g., Sarah & John, Movie Nights, Our Watchlist"
            error={errors.group_name}
            disabled={loading}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <TextArea
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            placeholder="Describe what you'd like to watch together..."
            disabled={loading}
            rows={3}
            className="w-full"
          />
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">💕</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-900">
                About Relationships
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Relationships are perfect for couples who want to find movies
                  and TV shows to watch together. You'll be able to:
                </p>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  <li>Share and sync your watchlists</li>
                  <li>Get personalized recommendations</li>
                  <li>Track what you've watched together</li>
                  <li>Schedule movie nights</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading} disabled={loading}>
          {loading ? 'Creating...' : 'Create Relationship'}
        </Button>
      </div>
    </form>
  );
}

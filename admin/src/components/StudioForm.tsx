import { useState, type FormEvent } from 'react';
import { supabase, STORAGE_BUCKET, getStudioImageUrl } from '../config/supabase';
import type { Studio } from '../types/studio';
import ImageUpload from './ImageUpload';

interface StudioFormProps {
  studio?: Studio;
  onSaved: () => void;
  onCancel: () => void;
}

export default function StudioForm({ studio, onSaved, onCancel }: StudioFormProps) {
  const isEditing = !!studio;

  const [name, setName] = useState(studio?.name ?? '');
  const [activityType, setActivityType] = useState<Studio['activity_type']>(
    studio?.activity_type ?? 'yoga'
  );
  const [city, setCity] = useState(studio?.city ?? 'San Francisco');
  const [address, setAddress] = useState(studio?.address ?? '');
  const [locationPill, setLocationPill] = useState(studio?.location_pill ?? '');
  const [url, setUrl] = useState(studio?.url ?? '');
  const [displayOrder, setDisplayOrder] = useState(studio?.display_order ?? 0);
  const [isActive, setIsActive] = useState(studio?.is_active ?? true);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const uploadImage = async (studioId: string, file: File, type: 'logo' | 'cover') => {
    const path = `${studioId}/${type}.png`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Failed to upload ${type}: ${uploadError.message}`);
    }

    return getStudioImageUrl(studioId, type);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const studioData = {
        name,
        activity_type: activityType,
        city,
        address: address || null,
        location_pill: locationPill || null,
        url: url || null,
        display_order: displayOrder,
        is_active: isActive,
      };

      let studioId = studio?.id;

      if (isEditing && studioId) {
        const { error: updateError } = await supabase
          .from('studios')
          .update(studioData)
          .eq('id', studioId);

        if (updateError) throw new Error(updateError.message);
      } else {
        const { data, error: insertError } = await supabase
          .from('studios')
          .insert(studioData)
          .select('id')
          .single();

        if (insertError) throw new Error(insertError.message);
        studioId = data.id;
      }

      // Upload images and update URLs
      const imageUpdates: { image_url?: string; logo_url?: string } = {};

      if (logoFile && studioId) {
        imageUpdates.logo_url = await uploadImage(studioId, logoFile, 'logo');
      }
      if (coverFile && studioId) {
        imageUpdates.image_url = await uploadImage(studioId, coverFile, 'cover');
      }

      if (Object.keys(imageUpdates).length > 0 && studioId) {
        const { error: urlError } = await supabase
          .from('studios')
          .update(imageUpdates)
          .eq('id', studioId);

        if (urlError) throw new Error(urlError.message);
      }

      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <h2 className="text-xl font-bold text-brand-darkBrown mb-6">
        {isEditing ? `Edit ${studio.name}` : 'Add New Studio'}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-brand-grayDark mb-1">
          Name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-brand-grayMedium
                     focus:outline-none focus:border-brand-darkBrown text-sm"
        />
      </div>

      {/* Activity type + Display order */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-brand-grayDark mb-1">
            Activity Type
          </label>
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as Studio['activity_type'])}
            className="w-full px-4 py-2.5 rounded-lg border border-brand-grayMedium
                       focus:outline-none focus:border-brand-darkBrown text-sm bg-white"
          >
            <option value="yoga">Yoga</option>
            <option value="pilates">Pilates</option>
            <option value="both">Both</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-grayDark mb-1">
            Display Order
          </label>
          <input
            type="number"
            min={0}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
            className="w-full px-4 py-2.5 rounded-lg border border-brand-grayMedium
                       focus:outline-none focus:border-brand-darkBrown text-sm"
          />
        </div>
      </div>

      {/* City + Location Pill */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-brand-grayDark mb-1">
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-brand-grayMedium
                       focus:outline-none focus:border-brand-darkBrown text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-brand-grayDark mb-1">
            Location Pill
          </label>
          <input
            type="text"
            value={locationPill}
            onChange={(e) => setLocationPill(e.target.value)}
            placeholder="e.g. Marina District"
            className="w-full px-4 py-2.5 rounded-lg border border-brand-grayMedium
                       focus:outline-none focus:border-brand-darkBrown text-sm"
          />
        </div>
      </div>

      {/* Address */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-brand-grayDark mb-1">
          Address
        </label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Full street address"
          className="w-full px-4 py-2.5 rounded-lg border border-brand-grayMedium
                     focus:outline-none focus:border-brand-darkBrown text-sm"
        />
      </div>

      {/* URL */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-brand-grayDark mb-1">
          External URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-2.5 rounded-lg border border-brand-grayMedium
                     focus:outline-none focus:border-brand-darkBrown text-sm"
        />
      </div>

      {/* Active toggle */}
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className={`relative w-10 h-6 rounded-full transition-colors ${
            isActive ? 'bg-green-500' : 'bg-brand-grayMedium'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              isActive ? 'left-5' : 'left-1'
            }`}
          />
        </button>
        <span className="text-sm text-brand-grayDark">
          {isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Image uploads */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <ImageUpload
          label="Logo"
          currentUrl={studio?.logo_url ?? null}
          onFileSelected={setLogoFile}
        />
        <ImageUpload
          label="Cover Photo"
          currentUrl={studio?.image_url ?? null}
          onFileSelected={setCoverFile}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2.5 bg-brand-darkBrown text-white font-semibold rounded-lg
                     hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
        >
          {saving ? 'Saving...' : isEditing ? 'Update Studio' : 'Create Studio'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-6 py-2.5 bg-white text-brand-grayDark font-medium rounded-lg
                     border border-brand-grayMedium hover:bg-brand-grayLight
                     transition-colors disabled:opacity-50 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

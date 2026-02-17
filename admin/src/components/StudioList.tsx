import { useEffect, useState } from 'react';
import { supabase, STORAGE_BUCKET } from '../config/supabase';
import type { Studio, ActivityFilter } from '../types/studio';

interface StudioListProps {
  onEdit: (studio: Studio) => void;
}

export default function StudioList({ onEdit }: StudioListProps) {
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ActivityFilter>('all');
  const [error, setError] = useState('');

  const fetchStudios = async () => {
    setLoading(true);
    setError('');

    let query = supabase
      .from('studios')
      .select('*')
      .order('display_order', { ascending: true });

    if (filter !== 'all') {
      query = query.or(`activity_type.eq.${filter},activity_type.eq.both`);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setStudios(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudios();
  }, [filter]);

  const toggleActive = async (studio: Studio) => {
    const { error: updateError } = await supabase
      .from('studios')
      .update({ is_active: !studio.is_active })
      .eq('id', studio.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    fetchStudios();
  };

  const deleteStudio = async (studio: Studio) => {
    if (!window.confirm(`Delete "${studio.name}"? This cannot be undone.`)) {
      return;
    }

    // Remove images from storage
    await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([`${studio.id}/logo.png`, `${studio.id}/cover.png`]);

    const { error: deleteError } = await supabase
      .from('studios')
      .delete()
      .eq('id', studio.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    fetchStudios();
  };

  const FILTERS: { label: string; value: ActivityFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Yoga', value: 'yoga' },
    { label: 'Pilates', value: 'pilates' },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value
                ? 'bg-brand-darkBrown text-white'
                : 'bg-white text-brand-grayDark hover:bg-brand-grayLight'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-brand-grayMuted">
          {studios.length} studio{studios.length !== 1 ? 's' : ''}
        </span>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-brand-grayMuted">Loading...</div>
      ) : studios.length === 0 ? (
        <div className="text-center py-12 text-brand-grayMuted">No studios found</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-brand-grayLight">
                <th className="px-4 py-3 text-xs font-semibold text-brand-grayMuted uppercase tracking-wider">Logo</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-grayMuted uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-grayMuted uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-grayMuted uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-grayMuted uppercase tracking-wider">Order</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-grayMuted uppercase tracking-wider">Active</th>
                <th className="px-4 py-3 text-xs font-semibold text-brand-grayMuted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {studios.map((studio) => (
                <tr
                  key={studio.id}
                  className="border-b border-brand-grayLight last:border-0 hover:bg-brand-grayLight/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    {studio.logo_url ? (
                      <img
                        src={studio.logo_url}
                        alt={`${studio.name} logo`}
                        className="w-10 h-10 rounded-lg object-cover bg-brand-grayLight"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-brand-grayLight flex items-center justify-center text-brand-grayMuted text-xs">
                        --
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{studio.name}</div>
                    {studio.url && (
                      <a
                        href={studio.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-grayMuted hover:underline truncate block max-w-[200px]"
                      >
                        {studio.url}
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      studio.activity_type === 'yoga'
                        ? 'bg-purple-100 text-purple-700'
                        : studio.activity_type === 'pilates'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {studio.activity_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-grayDark">
                    {studio.location_pill || studio.city || '--'}
                  </td>
                  <td className="px-4 py-3 text-sm text-brand-grayDark">
                    {studio.display_order}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleActive(studio)}
                      className={`relative w-10 h-6 rounded-full transition-colors ${
                        studio.is_active ? 'bg-green-500' : 'bg-brand-grayMedium'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          studio.is_active ? 'left-5' : 'left-1'
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEdit(studio)}
                        className="px-3 py-1.5 text-xs font-medium bg-brand-beige text-brand-darkBrown
                                   rounded-lg hover:opacity-80 transition-opacity"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteStudio(studio)}
                        className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600
                                   rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

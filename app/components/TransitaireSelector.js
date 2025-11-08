'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';

export default function TransitaireSelector() {
  const { t, language } = useLanguage();
  const [transitaires, setTransitaires] = useState([]);
  const [selectedTransitaire, setSelectedTransitaire] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchTransitaires();
  }, []);

  const fetchTransitaires = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/transitaires');
      const data = await response.json();
      setTransitaires(data);
    } catch (error) {
      console.error('Error fetching transitaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMandatPDF = async () => {
    if (!selectedTransitaire) {
      alert(t('selectTransitaireFirst'));
      return;
    }

    setGenerating(true);
    try {
      // Find the selected transitaire data
      const transitaire = transitaires.find(t => t._id === selectedTransitaire);
      
      if (!transitaire) {
        throw new Error('Transitaire not found');
      }

      // Check if PDF already exists in database
      if (transitaire.pdfUrl) {
        // Open the PDF in a new tab only
        window.open(transitaire.pdfUrl, '_blank');
      } else {
        // If no PDF exists, generate it
        const response = await fetch('/api/generate-mandat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            num_agrement: transitaire.num_agrement,
            nom_ou_raison_sociale: transitaire.nom_ou_raison_sociale,
            represente_par: transitaire.represente_par,
            nif: transitaire.nif,
            wilaya: transitaire.wilaya,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to generate mandate');
        }

        if (data.url) {
          // Update the transitaire with the new PDF URL
          await fetch(`/api/transitaires/${selectedTransitaire}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              num_agrement: transitaire.num_agrement,
              nom_ou_raison_sociale: transitaire.nom_ou_raison_sociale,
              represente_par: transitaire.represente_par,
              nif: transitaire.nif,
              wilaya: transitaire.wilaya,
              pdfUrl: data.url,
            }),
          });

          // Open the PDF in a new tab only
          window.open(data.url, '_blank');
          
          // Refresh the list to get updated PDF URL
          fetchTransitaires();
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(error.message || 'Error generating mandate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 border border-blue-200 dark:border-gray-700">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {t('mandatTransitaire')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {t('selectTransitaire')}
          </p>
          
          <div className="space-y-4">
            <select
              value={selectedTransitaire}
              onChange={(e) => setSelectedTransitaire(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">{t('selectTransitaire')}</option>
              {transitaires.map((transitaire) => (
                <option key={transitaire._id} value={transitaire._id}>
                  {transitaire.nom_ou_raison_sociale} - {transitaire.wilaya}
                </option>
              ))}
            </select>

            <button
              onClick={generateMandatPDF}
              disabled={!selectedTransitaire || generating}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {t('generating')}...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('downloadMandat')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

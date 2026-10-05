import React, { useState, useEffect } from 'react';

export default function App() {
  const [query, setQuery] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query.trim()) {
      setMedicines([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(query)}"&limit=20`, {
      signal: controller.signal
    })
      .then((res) => {
        if (res.status === 404) return { results: [] };
        if (!res.ok) throw new Error('Something went wrong');
        return res.json();
      })
      .then((data) => {
        setMedicines(data.results || []);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [query]);

  // Detail View
  if (selected) {
    const fda = selected.openfda || {};
    return (
      <div className="max-w-2xl mx-auto my-10 px-5 font-sans">
        <button 
          onClick={() => setSelected(null)}
          className="text-blue-600 hover:text-blue-800 text-sm mb-5 cursor-pointer flex items-center gap-1 font-medium"
        >
          Click Back to search
        </button>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {fda.brand_name?.[0] || 'Unknown Brand'}
        </h2>
        <p className="text-slate-600 mb-6">
          <strong className="text-slate-800">Generic:</strong> {fda.generic_name?.[0] || 'N/A'}
        </p>
        
        <div className="grid gap-3 text-sm text-slate-700 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div><strong className="text-slate-900">Manufacturer:</strong> {fda.manufacturer_name?.[0] || 'N/A'}</div>
          <div><strong className="text-slate-900">Product Type:</strong> {fda.product_type?.[0] || 'N/A'}</div>
          <div><strong className="text-slate-900">Route:</strong> {fda.route?.[0] || 'N/A'}</div>
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-2">Indications & Usage</h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {selected.purpose?.[0] || selected.indications_and_usage?.[0] || 'No detailed information available.'}
        </p>
      </div>
    );
  }

  // Search View
  return (
    <div className="max-w-2xl mx-auto my-14 px-5 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
          Medicine Directory
        </h1>
        <p className="text-slate-500 text-sm sm:text-base">
          Search the FDA database for drug labels, indications, and active ingredients.
        </p>
      </div>

      <div className="relative mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a medicine..."
          className="w-full pl-11 pr-4 py-3 text-sm sm:text-base border border-slate-200 rounded-full outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 shadow-sm transition"
        />
      </div>

      {loading && <p className="text-center text-slate-500 text-sm">Searching...</p>}
      {error && <p className="text-center text-red-500 text-sm">{error}</p>}
      {!loading && !error && query && medicines.length === 0 && (
        <p className="text-center text-slate-500 text-sm">No medicines found for "{query}".</p>
      )}

      <div className="grid gap-3">
        {medicines.map((med, index) => {
          const fda = med.openfda || {};
          return (
            <div
              key={med.id || index}
              onClick={() => setSelected(med)}
              className="p-4 border border-slate-200 rounded-xl cursor-pointer bg-white hover:border-slate-300 hover:shadow-sm transition"
            >
              <h3 className="font-semibold text-slate-900 text-base mb-1">
                {fda.brand_name?.[0] || 'Brand not available'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                {fda.generic_name?.[0] || 'N/A'}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
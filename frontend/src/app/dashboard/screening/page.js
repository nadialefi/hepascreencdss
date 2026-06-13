'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AlertTriangle, CheckCircle, Activity, Info, ChevronRight, Printer } from 'lucide-react';
import api from '@/lib/api';

// Reference normal ranges (example ranges, should be adjusted according to standard medical guidelines)
const normalRanges = {
  alb: { min: 38, max: 52, unit: 'g/L' },
  alp: { min: 40, max: 129, unit: 'IU/L' },
  alt: { min: 7, max: 55, unit: 'IU/L' },
  ast: { min: 8, max: 48, unit: 'IU/L' },
  bil: { min: 1.7, max: 20.5, unit: 'µmol/L' },
  che: { min: 5.3, max: 12.9, unit: 'kU/L' },
  chol: { min: 3.6, max: 5.2, unit: 'mmol/L' },
  crea: { min: 62, max: 106, unit: 'µmol/L' },
  ggt: { min: 8, max: 61, unit: 'IU/L' },
  prot: { min: 66, max: 87, unit: 'g/L' }
};

export default function ScreeningPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    setFullName(localStorage.getItem('full_name') || 'Tenaga Medis');
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    setResult(null);
    try {
      // Map to proper types
      const payload = {
        medical_record_number: data.mrn,
        name: data.name,
        age: parseInt(data.age),
        gender: data.gender,
        alb: parseFloat(data.alb),
        alp: parseFloat(data.alp),
        alt: parseFloat(data.alt),
        ast: parseFloat(data.ast),
        bil: parseFloat(data.bil),
        che: parseFloat(data.che),
        chol: parseFloat(data.chol),
        crea: parseFloat(data.crea),
        ggt: parseFloat(data.ggt),
        prot: parseFloat(data.prot)
      };

      const response = await api.post('/predict/', payload);
      setResult({
        ...response.data,
        probabilities: JSON.parse(response.data.probabilities),
        inputs: payload
      });
    } catch (error) {
      alert('Error saat melakukan prediksi. Silakan coba lagi.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (key, value) => {
    const range = normalRanges[key];
    if (!range) return 'text-slate-700 bg-slate-100';
    if (value < range.min || value > range.max) return 'text-red-700 bg-red-100 border-red-200 print:text-slate-900 print:border-slate-300 print:bg-white';
    // Add logic for 'yellow' if slightly out of bounds if needed
    return 'text-emerald-700 bg-emerald-100 border-emerald-200 print:text-slate-900 print:border-slate-300 print:bg-white';
  };

  return (
    <>
      <div className={`space-y-6 max-w-5xl mx-auto ${result ? 'print:hidden' : ''}`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Skrining Hepatitis C</h2>
            <p className="text-slate-600 mt-1">Masukkan data pasien dan hasil laboratorium untuk analisis ML.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h3 className="font-semibold text-slate-800 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-medical-600" />
              Formulir Pemeriksaan
            </h3>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Patient Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Data Pasien</h4>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Rekam Medis (MRN)</label>
                  <input
                    {...register("mrn", { required: "Nomor Rekam Medis wajib diisi" })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-medical-500 outline-none ${errors.mrn ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                    placeholder="e.g. RM-10293"
                  />
                  {errors.mrn && <span className="text-red-500 text-xs mt-1 block flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/>{errors.mrn.message}</span>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pasien</label>
                  <input
                    {...register("name", { required: "Nama Pasien wajib diisi" })}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-medical-500 outline-none ${errors.name ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                  />
                  {errors.name && <span className="text-red-500 text-xs mt-1 block flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/>{errors.name.message}</span>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Umur (Tahun)</label>
                    <input
                      type="number"
                      {...register("age", { required: "Wajib", min: {value:0, message:"Min 0"}, max: {value:120, message:"Max 120"} })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-medical-500 outline-none ${errors.age ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                    />
                    {errors.age && <span className="text-red-500 text-xs mt-1 block flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/>{errors.age.message}</span>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Kelamin</label>
                    <select
                      {...register("gender", { required: "Wajib" })}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-medical-500 outline-none ${errors.gender ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                    >
                      <option value="">Pilih...</option>
                      <option value="m">Laki-laki</option>
                      <option value="f">Perempuan</option>
                    </select>
                    {errors.gender && <span className="text-red-500 text-xs mt-1 block flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/>{errors.gender.message}</span>}
                  </div>
                </div>
              </div>

              {/* Lab Info */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Data Laboratorium</h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.keys(normalRanges).map((key) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-slate-700 mb-1 uppercase">
                        {key} <span className="text-xs text-slate-400 font-normal lowercase">({normalRanges[key].unit})</span>
                      </label>
                      <input
                        type="number"
                        step="any"
                        {...register(key, { required: "Wajib diisi" })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-medical-500 outline-none ${errors[key] ? 'border-red-500 bg-red-50' : 'border-slate-300'}`}
                      />
                      {errors[key] && <span className="text-red-500 text-xs mt-1 block flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/>{errors[key].message}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => reset()}
                className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg mr-4 hover:bg-slate-50 transition-colors"
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-2 bg-medical-600 text-white rounded-lg font-medium hover:bg-medical-700 transition-colors disabled:opacity-70 flex items-center"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>}
                Jalankan Analisis
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Results Section */}
      {result && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 mt-6 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 print:shadow-none print:border-none print:block print:w-full print:mt-0">
          <div className="hidden print:block text-center mb-8 border-b-2 border-slate-800 pb-4 pt-4">
            <h1 className="text-2xl font-bold uppercase tracking-wider">Hasil Skrining Hepatitis C</h1>
            <p className="text-sm text-slate-500 mt-1">Clinical Decision Support System - HepaScreen</p>
          </div>

          <div className="bg-medical-900 text-white px-6 py-4 flex justify-between items-center print:bg-white print:text-black print:px-0 print:py-2">
            <h3 className="font-bold text-lg flex items-center print:text-xl">
              <CheckCircle className="w-5 h-5 mr-2 text-medical-300 print:hidden" />
              Detail Hasil Analisis CDSS
            </h3>
            <span className="text-medical-200 text-sm print:hidden">
              Waktu komputasi: {result.execution_time_ms.toFixed(2)} ms
            </span>
            <span className="hidden print:block text-slate-600 text-sm font-medium">
              Tanggal: {new Date(result.created_at + 'Z').toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
            </span>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 print:px-0">
            <div>
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Kesimpulan Prediksi</h4>
              <div className="bg-medical-50 border border-medical-100 rounded-xl p-6 text-center print:bg-white print:border-slate-300">
                <p className="text-sm text-medical-600 font-medium mb-1 print:text-slate-600">Kelas Prediksi Utama</p>
                <h1 className="text-4xl font-black text-medical-800 tracking-tight print:text-slate-900">{result.prediction_result}</h1>
                <div className="mt-4 inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-medical-100 print:shadow-none print:border-slate-300">
                  <span className="text-sm font-semibold text-slate-600 mr-2">Confidence Score:</span>
                  <span className="text-lg font-bold text-emerald-600 print:text-slate-900">{result.confidence_score.toFixed(1)}%</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h5 className="text-sm font-semibold text-slate-700">Probabilitas Tiap Kelas:</h5>
                {Object.entries(result.probabilities).map(([className, prob]) => (
                  <div key={className} className="flex flex-col">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-600">{className}</span>
                      <span className="font-bold text-slate-800">{prob.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden print:border print:border-slate-200">
                      <div 
                        className={`h-2.5 rounded-full print:bg-slate-500 ${className === result.prediction_result ? 'bg-medical-500 print:bg-slate-800' : 'bg-slate-300 print:bg-slate-200'}`}
                        style={{ width: `${prob}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Identitas Pasien</h4>
              <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-50 p-4 rounded-lg print:bg-white print:border print:border-slate-300">
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">Nama Pasien</span>
                  <span className="block text-sm font-medium text-slate-900">{result.inputs.name}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">MRN</span>
                  <span className="block text-sm font-medium text-slate-900">{result.inputs.medical_record_number}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-500 uppercase">Umur / Gender</span>
                  <span className="block text-sm font-medium text-slate-900">{result.inputs.age} Thn / {result.inputs.gender === 'm' ? 'L' : 'P'}</span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b pb-2">Analisis Parameter</h4>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(normalRanges).map((key) => {
                  const val = result.inputs[key];
                  const range = normalRanges[key];
                  const isNormal = val >= range.min && val <= range.max;
                  return (
                    <div key={key} className={`p-3 rounded-lg border flex justify-between items-center ${getStatusColor(key, val)}`}>
                      <div>
                        <span className="block text-xs font-bold uppercase opacity-70">{key}</span>
                        <span className="block font-semibold">{val} <span className="text-xs font-normal opacity-80">{range.unit}</span></span>
                      </div>
                      {!isNormal && <AlertTriangle className="w-4 h-4 opacity-80 print:hidden" />}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex items-start p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 print:hidden">
                <Info className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
                <p className="text-xs font-medium leading-relaxed">
                  <strong>DISCLAIMER:</strong> Hasil prediksi ini merupakan Sistem Pendukung Keputusan (Clinical Decision Support System) berbasis Machine Learning dan <strong>TIDAK MENGGANTIKAN</strong> diagnosis klinis oleh tenaga medis profesional.
                </p>
              </div>

              <div className="mt-8 hidden print:block pt-8 border-t border-slate-300">
                <div className="flex justify-end">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-16">Tenaga Medis Pemeriksa,</p>
                    <p className="text-sm font-bold text-slate-900 underline">{fullName}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end print:hidden">
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-slate-800 text-white rounded-lg flex items-center hover:bg-slate-900 font-medium transition-colors"
            >
              <Printer className="w-5 h-5 mr-2" />
              Cetak Hasil (PDF)
            </button>
          </div>
        </div>
      )}
    </>
  );
}

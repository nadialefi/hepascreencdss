'use client';
import { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, FileText, X, Printer } from 'lucide-react';
import api from '@/lib/api';

export default function HistoryPage() {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/examinations/?limit=100');
        setExaminations(response.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Filter & Search
  const filteredExams = examinations.filter(exam => {
    const searchMatch = (
      exam.prediction_result.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.patient?.medical_record_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (exam.patient?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const filterMatch = filterClass ? exam.prediction_result === filterClass : true;
    return searchMatch && filterMatch;
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredExams.length / itemsPerPage));
  const currentItems = filteredExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderProbabilities = (probString) => {
    try {
      const probs = JSON.parse(probString);
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
          {Object.entries(probs).map(([className, score]) => (
            <div key={className} className="bg-white border border-slate-200 p-2 rounded shadow-sm text-center">
              <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">{className}</span>
              <span className="block text-sm font-medium text-slate-900">{Number(score).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      );
    } catch (e) {
      return <span className="text-sm text-slate-500">Data tidak tersedia</span>;
    }
  };

  return (
    <>
      <div className={`space-y-6 ${selectedExam ? 'print:hidden' : ''}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Riwayat Pemeriksaan</h2>
            <p className="text-slate-600 mt-1">Daftar riwayat analisis skrining Hepatitis C seluruh pasien.</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between bg-slate-50 items-center">
            <div className="relative w-full sm:max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-medical-500 sm:text-sm transition-colors"
                placeholder="Cari Nama/MRN Pasien..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-slate-500" />
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="block w-full pl-3 pr-8 py-2 border border-slate-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-medical-500 sm:text-sm transition-colors cursor-pointer"
              >
                <option value="">Semua Kategori</option>
                <option value="Blood Donor">Blood Donor</option>
                <option value="Hepatitis">Hepatitis</option>
                <option value="Fibrosis">Fibrosis</option>
                <option value="Cirrhosis">Cirrhosis</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Pasien (MRN)</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Hasil Prediksi</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Confidence</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                      <div className="flex justify-center mb-2">
                        <div className="w-6 h-6 border-2 border-medical-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      Memuat data...
                    </td>
                  </tr>
                ) : currentItems.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-10 text-center text-slate-500">Tidak ada data ditemukan.</td>
                  </tr>
                ) : (
                  currentItems.map((exam) => (
                    <tr key={exam.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        {new Date(exam.created_at + 'Z').toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{exam.patient?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-500">{exam.patient?.medical_record_number || `ID: ${exam.patient_id}`}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          exam.prediction_result === 'Blood Donor' ? 'bg-emerald-100 text-emerald-800' :
                          exam.prediction_result === 'Hepatitis' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {exam.prediction_result}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
                        {exam.confidence_score?.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => setSelectedExam(exam)}
                          className="text-medical-600 hover:text-medical-900 bg-medical-50 hover:bg-medical-100 px-3 py-1.5 rounded-lg inline-flex items-center transition-colors"
                        >
                          <FileText className="w-4 h-4 mr-1.5" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && filteredExams.length > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredExams.length)}</span> dari <span className="font-medium">{filteredExams.length}</span> hasil
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === i + 1 
                            ? 'z-10 bg-medical-50 border-medical-500 text-medical-600' 
                            : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 overflow-y-auto print:static print:z-auto print:overflow-visible" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0 print:block print:min-h-0 print:p-0">
            <div className="fixed inset-0 bg-slate-900 bg-opacity-75 transition-opacity print:hidden" aria-hidden="true" onClick={() => setSelectedExam(null)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen print:hidden" aria-hidden="true">&#8203;</span>

            <div className="relative z-10 inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full print:block print:w-full print:max-w-none print:shadow-none print:rounded-none print:my-0">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 print:p-0">
                {/* Header for Print (Hidden on Screen) */}
                <div className="hidden print:block text-center mb-8 border-b-2 border-slate-800 pb-4">
                  <h1 className="text-2xl font-bold uppercase tracking-wider">Hasil Skrining Hepatitis C</h1>
                  <p className="text-sm text-slate-500 mt-1">Clinical Decision Support System - HepaScreen</p>
                </div>

                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl leading-6 font-bold text-slate-900 print:hidden" id="modal-title">
                      Detail Pemeriksaan
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 font-medium">
                      Tanggal: {new Date(selectedExam.created_at + 'Z').toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                  <button onClick={() => setSelectedExam(null)} className="text-slate-400 hover:text-slate-500 print:hidden">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="mt-6 border-t border-slate-200 pt-4 max-h-[60vh] overflow-y-auto pr-2 print:max-h-none print:overflow-visible print:border-none print:pt-4">
                  <div className="grid grid-cols-2 gap-4 mb-6 bg-slate-50 p-4 rounded-lg print:border print:border-slate-300 print:bg-white">
                    <div>
                      <span className="block text-xs font-semibold text-slate-500 uppercase">Nama Pasien</span>
                      <span className="block text-sm font-medium text-slate-900">{selectedExam.patient?.name || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-500 uppercase">MRN</span>
                      <span className="block text-sm font-medium text-slate-900">{selectedExam.patient?.medical_record_number || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-500 uppercase">Umur / Gender</span>
                      <span className="block text-sm font-medium text-slate-900">{selectedExam.patient?.age || '-'} Thn / {selectedExam.patient?.gender === 'm' ? 'L' : 'P'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-slate-500 uppercase">Tenaga Medis</span>
                      <span className="block text-sm font-medium text-slate-900">{selectedExam.user?.full_name || '-'}</span>
                    </div>
                    <div className="col-span-2 border-t border-slate-200 mt-2 pt-4">
                      <span className="block text-xs font-semibold text-slate-500 uppercase">Kelas Hasil Prediksi</span>
                      <span className="block text-lg font-bold text-medical-600 print:text-slate-900">{selectedExam.prediction_result} ({selectedExam.confidence_score?.toFixed(1)}%)</span>
                    </div>
                  </div>

                  <div className="mb-6 bg-slate-50 p-4 rounded-lg print:border print:border-slate-300 print:bg-white">
                    <span className="block text-xs font-semibold text-slate-500 uppercase">Probabilitas Prediksi Seluruh Kelas</span>
                    {renderProbabilities(selectedExam.probabilities)}
                  </div>

                  <h4 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">Parameter Laboratorium</h4>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {['alb', 'alp', 'alt', 'ast', 'bil', 'che', 'chol', 'crea', 'ggt', 'prot'].map((key) => (
                      <div key={key} className="bg-white border border-slate-200 p-3 rounded-lg shadow-sm print:shadow-none">
                        <span className="block text-xs font-bold text-slate-500 uppercase mb-1">{key}</span>
                        <span className="block text-sm font-medium text-slate-900">{selectedExam[key]}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 hidden print:block pt-8 border-t border-slate-300">
                    <div className="flex justify-end">
                      <div className="text-center">
                        <p className="text-sm text-slate-600 mb-16">Tenaga Medis Pemeriksa,</p>
                        <p className="text-sm font-bold text-slate-900 underline">{selectedExam.user?.full_name || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-slate-200 print:hidden">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-slate-900 text-base font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={() => setSelectedExam(null)}
                >
                  Tutup
                </button>
                <button
                  type="button"
                  className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-lg border border-slate-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-medical-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors items-center"
                  onClick={() => window.print()}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Cetak PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

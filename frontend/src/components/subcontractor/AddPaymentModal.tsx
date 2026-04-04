import { useState } from 'react';
import { Payment, PaymentMethod, PaymentType, PaymentRecipient } from '@/types/domain';
import { formatCurrency } from '@/lib/dates';
import { calculateTaxAmount } from '@/lib/taxUtils';

interface Props {
  onClose: () => void;
  onSave: (payment: Payment) => Promise<void>;
  projectPrice: number;
}

export function AddPaymentModal({ onClose, onSave }: Props) {
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>('Cash 💵');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentType, setPaymentType] = useState<PaymentType>('client_payment');
  const [paidTo, setPaidTo] = useState<PaymentRecipient | ''>('');
  const [paidToSalesPerson, setPaidToSalesPerson] = useState('');
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const taxAmount = calculateTaxAmount(amount, taxPercentage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      alert('Please enter a valid payment amount');
      return;
    }

    setSaving(true);
    try {
      const payment: Payment = {
        id: crypto.randomUUID(),
        amount,
        method,
        date,
        taxPercentage,
        taxAmount,
        paymentType,
        paidTo: paidTo || undefined,
        paidToSalesPerson: paidToSalesPerson || undefined,
        notes: notes || undefined,
      };

      await onSave(payment);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden transform animate-in zoom-in-95 duration-200">
        {}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold">Add Payment Record</h2>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-4">
            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="input-field"
                  placeholder="0.00"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </div>

            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="input-field"
                required
              >
                <option value="Cash 💵">Cash 💵</option>
                <option value="Check 📝">Check 📝</option>
                <option value="Zelle 💸">Zelle 💸</option>
                <option value="Wire Transfer 🏦">Wire Transfer 🏦</option>
                <option value="Credit Card 💳">Credit Card 💳</option>
                <option value="Debit Card 💳">Debit Card 💳</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Payment Type <span className="text-red-500">*</span>
              </label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as PaymentType)}
                className="input-field"
                required
              >
                <option value="client_payment">Client Payment</option>
                <option value="subcontractor_payment">Subcontractor Payment</option>
                <option value="subcontractor_check_collected">Subcontractor Check Collected</option>
                <option value="sales_commission">Sales Commission</option>
              </select>
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Paid To
                </label>
                <select
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value as PaymentRecipient | '')}
                  className="input-field"
                >
                  <option value="">-- Select --</option>
                  <option value="subcontractor">Sub-Contractor</option>
                  <option value="sales_person">Sales Person</option>
                  <option value="company">Company</option>
                </select>
              </div>

              {paidTo === 'sales_person' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sales Person Name
                  </label>
                  <input
                    type="text"
                    value={paidToSalesPerson}
                    onChange={(e) => setPaidToSalesPerson(e.target.value)}
                    className="input-field"
                    placeholder="Enter sales person name"
                  />
                </div>
              )}
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tax Percentage
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={taxPercentage || ''}
                  onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                  className="input-field"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tax Amount
                </label>
                <div className="input-field bg-gray-100 text-gray-700 font-semibold">
                  {formatCurrency(taxAmount)}
                </div>
              </div>
            </div>

            {}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Additional notes or comments..."
              />
            </div>
          </div>

          {}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary w-full sm:w-auto order-2 sm:order-1"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary w-full sm:flex-1 order-1 sm:order-2"
              disabled={saving}
            >
              {saving ? 'Adding...' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

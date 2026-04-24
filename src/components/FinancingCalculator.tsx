'use client'

import { useState, useMemo } from 'react'
import { Calculator, ChevronDown, CreditCard, X } from 'lucide-react'
import { useCurrencyStore } from '@/store/useCurrencyStore'
import { toast } from 'sonner'

interface FinancingCalculatorProps {
  price: number // Price in listing's currency
  currency?: 'EUR' | 'RON'
}

export default function FinancingCalculator({ price, currency: listingCurrency = 'EUR' }: FinancingCalculatorProps) {
  const { currency, rate } = useCurrencyStore()
  const [isOpen, setIsOpen] = useState(false)
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)
  const [termMonths, setTermMonths] = useState(36)
  const [interestRate, setInterestRate] = useState(7.0)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [applying, setApplying] = useState(false)

  // Convert price to EUR first, then to current display currency
  const priceInEUR = listingCurrency === 'RON' ? price / rate : price
  const displayPrice = currency === 'RON' ? priceInEUR * rate : priceInEUR
  const currencySymbol = currency === 'RON' ? 'RON' : '€'

  // Calculate monthly payment using PMT formula
  const monthlyPayment = useMemo(() => {
    const principal = displayPrice * (1 - downPaymentPercent / 100)
    const monthlyRate = interestRate / 100 / 12
    const n = termMonths

    if (monthlyRate === 0) {
      return principal / n
    }

    const pmt = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)
    return pmt
  }, [displayPrice, downPaymentPercent, termMonths, interestRate])

  const formatMonthly = () => {
    if (currency === 'RON') {
      return `${Math.round(monthlyPayment).toLocaleString('ro-RO')} RON/lună`
    }
    return `€${Math.round(monthlyPayment).toLocaleString('de-DE')}/lună`
  }

  const handleApply = async () => {
    if (!showApplyModal) {
      setShowApplyModal(true)
      return
    }
    
    // MVP: Show coming soon message
    setApplying(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setApplying(false)
    setShowApplyModal(false)
    toast.info('📢 Funcționalitate în dezvoltare! În curând vei putea aplica pentru finanțare direct pe site.')
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-medium transition-all hover:border-green-500 hover:text-green-700 hover:bg-green-50"
      >
        <Calculator className="w-5 h-5" />
        <span>Calculează rata lunară</span>
      </button>
    )
  }

  return (
    <>
      <div className="border-2 border-green-500 rounded-xl p-4 bg-green-50/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-green-600" />
            Calculator Finanțare
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Price display */}
        <div className="text-center mb-4">
          <span className="text-sm text-gray-500">Preț </span>
          <span className="text-xl font-bold text-gray-900">
            {currency === 'RON' 
              ? `${Math.round(displayPrice).toLocaleString('ro-RO')} RON`
              : `€${displayPrice.toLocaleString('de-DE')}`}
          </span>
        </div>

        {/* Down payment slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Avans</span>
            <span className="font-medium text-gray-900">{downPaymentPercent}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="5"
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span>
            <span>50%</span>
          </div>
        </div>

        {/* Term months */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 block mb-2">Perioadă</label>
          <div className="relative">
            <select
              value={termMonths}
              onChange={(e) => setTermMonths(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value={12}>12 luni</option>
              <option value={24}>24 luni</option>
              <option value={36}>36 luni</option>
              <option value={48}>48 luni</option>
              <option value={60}>60 luni</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Interest rate */}
        <div className="mb-4">
          <label className="text-sm text-gray-600 block mb-2">Dobândă anuală (%)</label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(Number(e.target.value))}
            min="0"
            max="20"
            step="0.5"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Monthly payment result */}
        <div className="text-center py-4 bg-white rounded-lg border border-gray-100 mb-4">
          <p className="text-sm text-gray-500 mb-1">Rată lunară aproximativă</p>
          <p className="text-2xl font-black text-green-700">{formatMonthly()}</p>
          <p className="text-xs text-gray-400 mt-1">*Exemplu orientativ</p>
        </div>

        {/* Apply button */}
        <button
          onClick={handleApply}
          disabled={applying}
          className="w-full py-3 bg-gradient-to-r from-green-700 to-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-green-700/30 transition-all disabled:opacity-50"
        >
          <CreditCard className="w-5 h-5" />
          {applying ? 'Se procesează...' : 'Aplică pentru finanțare'}
        </button>
      </div>

      {/* Simple apply modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowApplyModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              📢 Funcționalitate în dezvoltare
            </h3>
            <p className="text-gray-600 mb-4">
              Calculatorul de finanțare este funcțional, dar aplicația directă pe site va fi disponibilă în curând.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800 mb-4">
              💡 Pentru finanțare imediată, contactează vânzătorul pentru a discuta opțiunile disponibile.
            </div>
            <button
              onClick={() => setShowApplyModal(false)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Înțeleg, închide
            </button>
          </div>
        </div>
      )}
    </>
  )
}
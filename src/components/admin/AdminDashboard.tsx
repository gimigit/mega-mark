'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  BarChart3, Users, MessageSquare, AlertTriangle, 
  CheckCircle, XCircle, Trash2, Eye, Shield,
  TrendingUp, Clock, FileText
} from 'lucide-react'

interface Listing {
  id: string
  title: string
  status: string
  price: number | null
  currency: string
  location_region: string | null
  location_city: string | null
  created_at: string
  seller: { id: string; full_name: string; email: string; role: string; verified: boolean }
  category: { id: string; name: string; slug: string } | null
  photos: { id: string; url: string; position: number }[]
  views_count: number
  is_featured: boolean
}

interface Report {
  id: string
  reason: string
  created_at: string
  resolved: boolean
  listing: {
    id: string
    title: string
    seller: { id: string; full_name: string; email: string }
  } | null
  reporter: { id: string; full_name: string; email: string }
}

interface Stats {
  totalAds: number
  activeAds: number
  expiredAds: number
  soldAds: number
  totalUsers: number
  newUsersToday: number
  totalMessages: number
  messagesToday: number
  unresolvedReports: number
}

interface AdminDashboardProps {
  initialAds: Listing[]
  initialReports: Report[]
  initialStats: Stats
  adminUser: { id: string; name: string; email: string }
}

export function AdminDashboard({ initialAds, initialReports, initialStats, adminUser }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'ads' | 'reports'>('stats')
  const [ads, setAds] = useState<Listing[]>(initialAds)
  const [reports, setReports] = useState<Report[]>(initialReports)
  const [stats] = useState<Stats>(initialStats)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState<string | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'expired': return 'bg-gray-500'
      case 'sold': return 'bg-blue-500'
      default: return 'bg-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activ'
      case 'expired': return 'Expirat'
      case 'sold': return 'Vândut'
      default: return status
    }
  }

  const formatCurrency = (price: number | null, currency: string) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('ro-RO', { 
      style: 'currency', 
      currency: currency || 'EUR' 
    }).format(price)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleAdAction = async (adId: string, action: 'delete') => {
    if (!confirm(`Sigur vrei să ${action === 'delete' ? 'ștergi' : 'modifici'} acest anunț?`)) return
    
    setLoading(adId)
    try {
      if (action === 'delete') {
        await fetch(`/api/listings/${adId}`, { method: 'DELETE' })
        setAds(prev => prev.filter(ad => ad.id !== adId))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  const handleToggleFeatured = async (adId: string, currentFeatured: boolean) => {
    setLoading(adId)
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adId, is_featured: !currentFeatured })
      })
      if (res.ok) {
        setAds(prev => prev.map(ad => 
          ad.id === adId ? { ...ad, is_featured: !currentFeatured } : ad
        ))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(null)
    }
  }

  const filteredAds = statusFilter === 'all' 
    ? ads 
    : ads.filter(ad => ad.status === statusFilter)

  const StatCard = ({ 
    title, value, icon: Icon, color, subtext 
  }: { 
    title: string; value: number; icon: any; color: string; subtext: string 
  }) => (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-full bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-slate-900 text-white py-4 px-6 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">Conectat ca: {adminUser.name}</span>
            <Link href="/" className="text-sm text-blue-400 hover:text-blue-300">
              Înapoi la site
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6">
          <nav className="flex gap-1">
            {[
              { id: 'stats', label: 'Statistici', icon: BarChart3 },
              { id: 'ads', label: 'Anunțuri', icon: FileText },
              { id: 'reports', label: 'Rapoarte', icon: AlertTriangle }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'reports' && stats.unresolvedReports > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.unresolvedReports}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Panou de control</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Anunțuri Totale"
                value={stats.totalAds}
                icon={FileText}
                color="blue"
                subtext={`${stats.activeAds} active`}
              />
              <StatCard
                title="Utilizatori"
                value={stats.totalUsers}
                icon={Users}
                color="green"
                subtext={`${stats.newUsersToday} noi azi`}
              />
              <StatCard
                title="Mesaje"
                value={stats.totalMessages}
                icon={MessageSquare}
                color="purple"
                subtext={`${stats.messagesToday} azi`}
              />
              <StatCard
                title={stats.unresolvedReports > 0 ? 'Rapoarte' : 'Vizualizări'}
                value={stats.unresolvedReports > 0 ? stats.unresolvedReports : 0}
                icon={stats.unresolvedReports > 0 ? AlertTriangle : TrendingUp}
                color={stats.unresolvedReports > 0 ? 'red' : 'orange'}
                subtext={stats.unresolvedReports > 0 ? 'nerezolvate' : 'total vizualizări'}
              />
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Distribuție anunțuri</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.activeAds}</div>
                  <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="text-center p-4 bg-gray-100 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{stats.expiredAds}</div>
                  <div className="text-sm text-gray-600">Expirate</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.soldAds}</div>
                  <div className="text-sm text-gray-600">Vândute</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ads Tab */}
        {activeTab === 'ads' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Gestionare Anunțuri</h2>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Toate</option>
                <option value="active">Active</option>
                <option value="expired">Expirate</option>
                <option value="sold">Vândute</option>
              </select>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anunț</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vânzător</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preț</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredAds.map(ad => (
                    <tr key={ad.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {ad.photos && ad.photos.length > 0 ? (
                            <img
                              src={ad.photos[0].url}
                              alt={ad.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <FileText className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <Link 
                              href={`/anunt/${ad.category?.slug}/${ad.id}`}
                              target="_blank"
                              className="font-medium text-blue-600 hover:underline"
                            >
                              {ad.title}
                            </Link>
                            <div className="text-sm text-gray-500">
                              {ad.category?.name} • {ad.location_region}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div>{ad.seller?.full_name || 'N/A'}</div>
                          <div className="text-gray-500 text-xs">
                            {ad.seller?.verified && <CheckCircle className="w-3 h-3 inline text-green-500 mr-1" />}
                            {ad.seller?.role}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium">{formatCurrency(ad.price, ad.currency)}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          ad.status === 'active' ? 'bg-green-100 text-green-800' :
                          ad.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${getStatusColor(ad.status)}`} />
                          {getStatusLabel(ad.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/anunt/${ad.category?.slug}/${ad.id}`}
                            target="_blank"
                            className="p-1 text-gray-400 hover:text-blue-600"
                            title="Vezi anunțul"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleToggleFeatured(ad.id, ad.is_featured)}
                            disabled={loading === ad.id}
                            className={`p-1 ${ad.is_featured ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                            title={ad.is_featured ? 'Scoate din promovate' : 'Marchează ca promovat'}
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleAdAction(ad.id, 'delete')}
                            disabled={loading === ad.id}
                            className="p-1 text-gray-400 hover:text-red-600"
                            title="Șterge"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAds.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Nu există anunțuri {statusFilter !== 'all' && `cu statusul "${getStatusLabel(statusFilter)}"`}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Rapoarte</h2>
            
            {reports.length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anunț</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motiv</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raportat de</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {reports.map(report => (
                      <tr key={report.id}>
                        <td className="px-4 py-4">
                          {report.listing ? (
                            <div>
                              <Link 
                                href={`/anunt/${report.listing.id}`}
                                target="_blank"
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {report.listing.title}
                              </Link>
                              <div className="text-sm text-gray-500">
                                Vânzător: {report.listing.seller?.full_name}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">Anunț șters</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium">{report.reason}</span>
                        </td>
                        <td className="px-4 py-4 text-sm">
                          {report.reporter?.full_name}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-500">
                          {formatDate(report.created_at)}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => {/* handle resolve */}}
                            disabled={report.resolved}
                            className={`px-3 py-1 rounded text-sm ${
                              report.resolved 
                                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            {report.resolved ? 'Rezolvat' : 'Rezolvă'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nu există rapoarte</h3>
                <p className="text-gray-500 mt-2">
                  Toate rapoartele au fost rezolvate sau nu există rapoarte active.
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

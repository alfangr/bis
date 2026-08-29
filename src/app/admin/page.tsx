'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Bus as BusIcon,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Building2,
  LayoutDashboard,
  Clock,
  Banknote,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Bus, City } from '@/types';
import {
  getCities,
  saveCities,
  getBuses,
  saveBuses,
  generateId,
  exportDatabase,
} from '@/lib/sqlite-db';

type AdminTab = 'cities' | 'buses';
type ModalMode = 'create' | 'edit' | null;

const formatNumber = (value: number): string => value.toLocaleString('id-ID');
const parseNumber = (value: string): number => Number(value.replace(/[^0-9]/g, '')) || 0;

const CityFormFields = ({
  value,
  onChange,
}: {
  value: Omit<City, 'id'>;
  onChange: (v: Omit<City, 'id'>) => void;
}) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="city-name">Nama Kota</Label>
      <Input
        id="city-name"
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        placeholder="Contoh: Malang"
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="city-province">Provinsi</Label>
      <Input
        id="city-province"
        value={value.province}
        onChange={(e) => onChange({ ...value, province: e.target.value })}
        placeholder="Contoh: Jawa Timur"
      />
    </div>
  </div>
);

type BusStopFormValue = {
  city: string;
  price: number;
};

type BusFormValue = {
  poName: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  price: number;
  stops: BusStopFormValue[];
};

const BusFormFields = ({
  value,
  onChange,
  cities,
}: {
  value: BusFormValue;
  onChange: (v: BusFormValue) => void;
  cities: City[];
}) => {
  const updateStop = (index: number, patch: Partial<BusStopFormValue>) => {
    onChange({
      ...value,
      stops: value.stops.map((s, i) => (i === index ? { ...s, ...patch } : s)),
    });
  };

  const addStop = () => {
    onChange({ ...value, stops: [...value.stops, { city: '', price: 0 }] });
  };

  const removeStop = (index: number) => {
    onChange({ ...value, stops: value.stops.filter((_, i) => i !== index) });
  };

  return (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="po-name">Nama PO Bis</Label>
        <Input
          id="po-name"
          value={value.poName}
          onChange={(e) => onChange({ ...value, poName: e.target.value })}
          placeholder="Contoh: Bis Jaya Indah"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bus-from">Kota Asal</Label>
        <Select value={value.from} onValueChange={(v) => onChange({ ...value, from: v })}>
          <SelectTrigger id="bus-from">
            <SelectValue placeholder="Pilih kota asal" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.id} value={city.name}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bus-to">Kota Tujuan</Label>
        <Select value={value.to} onValueChange={(v) => onChange({ ...value, to: v })}>
          <SelectTrigger id="bus-to">
            <SelectValue placeholder="Pilih kota tujuan" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={`to-${city.id}`} value={city.name}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bus-departure" className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          Jam Berangkat
        </Label>
        <Input
          id="bus-departure"
          type="time"
          value={value.departure}
          onChange={(e) => onChange({ ...value, departure: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bus-arrival" className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          Jam Tiba
        </Label>
        <Input
          id="bus-arrival"
          type="time"
          value={value.arrival}
          onChange={(e) => onChange({ ...value, arrival: e.target.value })}
        />
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="bus-price" className="flex items-center gap-2">
          <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
          Harga Tiket (Rp)
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-muted-foreground">
            Rp
          </span>
          <Input
            id="bus-price"
            inputMode="numeric"
            value={formatNumber(value.price)}
            onChange={(e) => onChange({ ...value, price: parseNumber(e.target.value) })}
            className="pl-10 tabular-nums"
            placeholder="150.000"
          />
        </div>
      </div>
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Titik Berhenti (opsional)</Label>
        <Button type="button" variant="outline" size="sm" onClick={addStop} className="gap-1 h-7 px-2 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Tambah Titik Berhenti
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Rute resmi tetap {value.from || '...'} - {value.to || '...'}. Titik berhenti dipakai kalau
        penumpang turun di kota tengah rute dengan harga yang berbeda dari harga tiket penuh.
      </p>
      {value.stops.length > 0 && (
        <div className="space-y-2 pt-1">
          {value.stops.map((stop, index) => (
            <div key={index} className="flex items-center gap-2">
              <Select
                value={stop.city}
                onValueChange={(v) => updateStop(index, { city: v })}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Pilih kota berhenti" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={`stop-${index}-${city.id}`} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-36">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-muted-foreground">
                  Rp
                </span>
                <Input
                  inputMode="numeric"
                  value={formatNumber(stop.price)}
                  onChange={(e) => updateStop(index, { price: parseNumber(e.target.value) })}
                  className="pl-10 tabular-nums"
                  placeholder="10.000"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeStop(index)}
                className="h-9 w-9 shrink-0 hover:text-destructive"
                aria-label="Hapus titik berhenti"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
  );
};

const EMPTY_CITY: Omit<City, 'id'> = { name: '', province: '' };
const EMPTY_BUS: BusFormValue = {
  poName: '',
  from: '',
  to: '',
  departure: '',
  arrival: '',
  price: 0,
  stops: [],
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>('cities');

  const [cities, setCities] = useState<City[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [cityForm, setCityForm] = useState<Omit<City, 'id'>>(EMPTY_CITY);
  const [busForm, setBusForm] = useState<BusFormValue>(EMPTY_BUS);

  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState<Record<AdminTab, boolean>>({
    cities: false,
    buses: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    void loadData(tab, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async (targetTab: AdminTab, force = false) => {
    if (initialLoadDone[targetTab] && !force) return;
    setLoading(true);
    setError(null);
    try {
      if (targetTab === 'cities') {
        setCities(await getCities());
      } else {
        if (!initialLoadDone.cities) {
          setCities(await getCities());
          setInitialLoadDone((s) => ({ ...s, cities: true }));
        }
        setBuses(await getBuses());
      }
      setInitialLoadDone((s) => ({ ...s, [targetTab]: true }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memuat data';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = async (next: AdminTab) => {
    setTab(next);
    setSuccess(null);
    setError(null);
    await loadData(next);
  };

  const openCreate = () => {
    setModalMode('create');
    setEditId(null);
    setError(null);
    setCityForm(EMPTY_CITY);
    setBusForm(EMPTY_BUS);
  };

  const openEdit = (item: City | Bus) => {
    setModalMode('edit');
    setError(null);
    if (tab === 'cities') {
      const c = item as City;
      setEditId(c.id);
      setCityForm({ name: c.name, province: c.province });
    } else {
      const b = item as Bus;
      setEditId(b.id);
      setBusForm({
        poName: b.poName,
        from: b.from,
        to: b.to,
        departure: b.departure,
        arrival: b.arrival,
        price: b.price,
        stops: b.stops ? b.stops.map((s) => ({ city: s.city, price: s.price })) : [],
      });
    }
  };

  const closeModal = () => {
    setModalMode(null);
    setEditId(null);
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (tab === 'cities') {
        if (!cityForm.name.trim() || !cityForm.province.trim()) {
          throw new Error('Nama kota dan provinsi wajib diisi');
        }
        if (modalMode === 'create') {
          const created: City = {
            id: generateId('CITY', cities),
            name: cityForm.name.trim(),
            province: cityForm.province.trim(),
          };
          const next = [...cities, created];
          await saveCities(next);
          setCities(next);
          setSuccess('Kota berhasil ditambahkan');
        } else if (modalMode === 'edit' && editId) {
          const next = cities.map((c) =>
            c.id === editId
              ? { ...c, name: cityForm.name.trim(), province: cityForm.province.trim() }
              : c
          );
          await saveCities(next);
          setCities(next);
          setSuccess('Kota berhasil diperbarui');
        }
      } else {
        if (
          !busForm.poName.trim() ||
          !busForm.from.trim() ||
          !busForm.to.trim() ||
          !busForm.departure.trim() ||
          !busForm.arrival.trim()
        ) {
          throw new Error('Semua field wajib harus diisi dengan benar');
        }
        const stops = busForm.stops
          .filter((s) => s.city.trim())
          .map((s) => ({ city: s.city.trim(), price: s.price }));
        if (modalMode === 'create') {
          const created: Bus = {
            id: generateId('BIS', buses),
            poName: busForm.poName.trim(),
            poPhone: '',
            from: busForm.from.trim(),
            to: busForm.to.trim(),
            departure: busForm.departure.trim(),
            arrival: busForm.arrival.trim(),
            duration: '',
            price: busForm.price,
            seats: { available: 0, total: 0 },
            amenities: [],
            stops: stops.length > 0 ? stops : undefined,
          };
          const next = [...buses, created];
          await saveBuses(next);
          setBuses(next);
          setSuccess('Bis berhasil ditambahkan');
        } else if (modalMode === 'edit' && editId) {
          const next = buses.map((b) =>
            b.id === editId
              ? {
                  ...b,
                  poName: busForm.poName.trim(),
                  from: busForm.from.trim(),
                  to: busForm.to.trim(),
                  departure: busForm.departure.trim(),
                  arrival: busForm.arrival.trim(),
                  price: busForm.price,
                  stops: stops.length > 0 ? stops : undefined,
                }
              : b
          );
          await saveBuses(next);
          setBuses(next);
          setSuccess('Bis berhasil diperbarui');
        }
      }
      closeModal();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Operasi gagal';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (tab === 'cities') {
        const next = cities.filter((c) => c.id !== id);
        await saveCities(next);
        setCities(next);
      } else {
        const next = buses.filter((b) => b.id !== id);
        await saveBuses(next);
        setBuses(next);
      }
      setSuccess('Data berhasil dihapus');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Hapus data gagal';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportDatabase = async () => {
    setError(null);
    try {
      const bytes = await exportDatabase();
      const buffer = bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength
      ) as ArrayBuffer;
      const blob = new Blob([buffer], { type: 'application/x-sqlite3' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bis-inform.sqlite';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengekspor database';
      setError(message);
    }
  };

  const modalTitle =
    tab === 'cities'
      ? modalMode === 'create'
        ? 'Tambah Kota Baru'
        : 'Edit Kota'
      : modalMode === 'create'
        ? 'Tambah Bis Baru'
        : 'Edit Bis';

  const currentList = tab === 'cities' ? cities : buses;
  const totalAll = useMemo(() => cities.length + buses.length, [cities, buses]);
  const statsReady = initialLoadDone.cities && initialLoadDone.buses;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-heading text-2xl font-extrabold text-card-foreground sm:text-3xl">
                  Dashboard Admin
                </h1>
                <p className="text-sm text-muted-foreground">
                  Kelola data kota dan bis
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            <Button
              onClick={() => {
                setInitialLoadDone({ cities: false, buses: false });
                void Promise.all([loadData('cities', true), loadData('buses', true)]);
              }}
              variant="outline"
              className="gap-2"
              disabled={loading}
            >
              <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
            <Button onClick={handleExportDatabase} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export Database
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total Kota
                </p>
                <p className="font-heading text-2xl font-bold text-card-foreground">
                  {statsReady ? cities.length : '—'}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-accent/10 to-background border-accent/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20">
                <BusIcon className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total Bis
                </p>
                <p className="font-heading text-2xl font-bold text-card-foreground">
                  {statsReady ? buses.length : '—'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-6 border-green-500/50 bg-green-50 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <Card className="border-border">
          <CardHeader className="pb-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="inline-flex h-10 items-center justify-start gap-1 rounded-lg bg-muted p-1 text-muted-foreground w-fit flex-wrap">
                <Button
                  variant={tab === 'cities' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => switchTab('cities')}
                  className="gap-2 h-8"
                >
                  <MapPin className="h-4 w-4" />
                  Kota
                  <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[10px]">
                    {initialLoadDone.cities ? cities.length : '?'}
                  </Badge>
                </Button>
                <Button
                  variant={tab === 'buses' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => switchTab('buses')}
                  className="gap-2 h-8"
                >
                  <BusIcon className="h-4 w-4" />
                  Bis
                  <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[10px]">
                    {initialLoadDone.buses ? buses.length : '?'}
                  </Badge>
                </Button>
              </div>
              <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
                <Plus className="h-4 w-4" />
                Tambah {tab === 'cities' ? 'Kota' : 'Bis'}
              </Button>
            </div>
          </CardHeader>
          <Separator className="my-6" />
          <CardContent className="pt-0">
            {loading && currentList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin mb-3" />
                <p className="text-sm">Memuat data...</p>
              </div>
            ) : currentList.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  {tab === 'cities' ? (
                    <MapPin className="h-8 w-8" />
                  ) : (
                    <BusIcon className="h-8 w-8" />
                  )}
                </div>
                <h3 className="font-semibold text-card-foreground mb-1">
                  Belum ada data
                </h3>
                <p className="text-sm">
                  Klik tombol &quot;Tambah&quot; untuk memasukkan data pertama.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border -mx-1 sm:mx-0">
                {tab === 'cities' && (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-muted-foreground w-24">ID</th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground">Nama Kota</th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground">Provinsi</th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground text-right w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {cities.map((city) => (
                        <tr key={city.id} className="hover:bg-muted/30">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{city.id}</td>
                          <td className="px-4 py-3 font-medium text-card-foreground flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {city.name}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{city.province}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(city)} className="h-8 w-8 hover:text-primary" aria-label="Edit kota">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(city.id)} className="h-8 w-8 hover:text-destructive" aria-label="Hapus kota">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {tab === 'buses' && (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-muted-foreground w-24">ID</th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground">PO Bis</th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground">Rute</th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground">Jam</th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground">Titik Berhenti</th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground text-right">Harga</th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground text-right w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {buses.map((bus) => (
                        <tr key={bus.id} className="hover:bg-muted/30 align-top">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{bus.id}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-card-foreground">{bus.poName}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="text-card-foreground">{bus.from}</span>
                            <span className="mx-1 text-muted-foreground">→</span>
                            <span className="text-card-foreground">{bus.to}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="text-card-foreground">{bus.departure} - {bus.arrival}</p>
                          </td>
                          <td className="px-4 py-3">
                            {bus.stops && bus.stops.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {bus.stops.map((s) => (
                                  <Badge key={s.city} variant="outline" className="font-normal">
                                    {s.city} · Rp{s.price.toLocaleString('id-ID')}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-card-foreground whitespace-nowrap tabular-nums">
                            Rp {bus.price.toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(bus)} className="h-8 w-8 hover:text-primary" aria-label="Edit bis">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(bus.id)} className="h-8 w-8 hover:text-destructive" aria-label="Hapus bis">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Total data tersimpan: {statsReady ? totalAll : '?'} item · Database SQLite (sql.js) di
          browser — klik &quot;Export Database&quot; untuk menyimpan perubahan secara permanen
        </p>
      </div>

      {modalMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-background shadow-2xl border border-border">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-heading text-xl font-bold text-card-foreground">
                {modalTitle}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal} aria-label="Tutup modal" className="h-8 w-8">
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-6 max-h-[80vh] overflow-y-auto">
              {error && (
                <Alert variant="destructive" className="mb-5">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {tab === 'cities' && (
                <CityFormFields value={cityForm} onChange={setCityForm} />
              )}
              {tab === 'buses' && (
                <BusFormFields value={busForm} onChange={setBusForm} cities={cities} />
              )}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-border bg-muted/20 rounded-b-2xl">
              <Button variant="outline" onClick={closeModal} disabled={loading}>
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {modalMode === 'create' ? 'Simpan' : 'Perbarui'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

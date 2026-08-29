'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Bus as BusIcon,
  Route as RouteIcon,
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
import type { Bus, City, Route } from '@/types';
import {
  getCities,
  saveCities,
  getBuses,
  saveBuses,
  getRoutes,
  saveRoutes,
  generateId,
  exportDatabase,
} from '@/lib/sqlite-db';

type AdminTab = 'cities' | 'buses' | 'routes';
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

type BusFormValue = {
  poName: string;
  busClass: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  price: number;
};

const BusFormFields = ({
  value,
  onChange,
  cities,
}: {
  value: BusFormValue;
  onChange: (v: BusFormValue) => void;
  cities: City[];
}) => (
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
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="bus-class">Kelas Bis</Label>
        <Select value={value.busClass} onValueChange={(v) => onChange({ ...value, busClass: v })}>
          <SelectTrigger id="bus-class">
            <SelectValue placeholder="Pilih kelas bis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Standar">Standar</SelectItem>
            <SelectItem value="Executive">Executive</SelectItem>
            <SelectItem value="VIP">VIP</SelectItem>
          </SelectContent>
        </Select>
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
  </div>
);

const RouteFormFields = ({
  value,
  onChange,
  cities,
}: {
  value: Omit<Route, 'id'>;
  onChange: (v: Omit<Route, 'id'>) => void;
  cities: City[];
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="route-from">Kota Asal</Label>
        <Select value={value.from} onValueChange={(v) => onChange({ ...value, from: v })}>
          <SelectTrigger id="route-from">
            <SelectValue placeholder="Pilih kota asal" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={`r-from-${city.id}`} value={city.name}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="route-to">Kota Tujuan</Label>
        <Select value={value.to} onValueChange={(v) => onChange({ ...value, to: v })}>
          <SelectTrigger id="route-to">
            <SelectValue placeholder="Pilih kota tujuan" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={`r-to-${city.id}`} value={city.name}>
                {city.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="route-min" className="flex items-center gap-2">
          <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
          Harga Minimum (Rp)
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-muted-foreground">
            Rp
          </span>
          <Input
            id="route-min"
            inputMode="numeric"
            value={formatNumber(value.minPrice)}
            onChange={(e) => onChange({ ...value, minPrice: parseNumber(e.target.value) })}
            className="pl-10 tabular-nums"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="route-max" className="flex items-center gap-2">
          <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
          Harga Maksimum (Rp)
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm font-medium text-muted-foreground">
            Rp
          </span>
          <Input
            id="route-max"
            inputMode="numeric"
            value={formatNumber(value.maxPrice)}
            onChange={(e) => onChange({ ...value, maxPrice: parseNumber(e.target.value) })}
            className="pl-10 tabular-nums"
          />
        </div>
      </div>
      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor="route-count">Jumlah Bis di Rute Ini</Label>
        <Input
          id="route-count"
          type="number"
          min={0}
          value={value.busCount}
          onChange={(e) => onChange({ ...value, busCount: Number(e.target.value) || 0 })}
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="route-desc">Deskripsi Rute</Label>
      <textarea
        id="route-desc"
        rows={3}
        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        value={value.description}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        placeholder="Deskripsi singkat tentang rute ini"
      />
    </div>
  </div>
);

const EMPTY_CITY: Omit<City, 'id'> = { name: '', province: '' };
const EMPTY_BUS: BusFormValue = {
  poName: '',
  busClass: '',
  from: '',
  to: '',
  departure: '',
  arrival: '',
  price: 0,
};
const EMPTY_ROUTE: Omit<Route, 'id'> = {
  from: '',
  to: '',
  minPrice: 0,
  maxPrice: 0,
  busCount: 0,
  description: '',
};

export default function AdminDashboard() {
  const [tab, setTab] = useState<AdminTab>('cities');

  const [cities, setCities] = useState<City[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [cityForm, setCityForm] = useState<Omit<City, 'id'>>(EMPTY_CITY);
  const [busForm, setBusForm] = useState<BusFormValue>(EMPTY_BUS);
  const [routeForm, setRouteForm] = useState<Omit<Route, 'id'>>(EMPTY_ROUTE);

  const [loading, setLoading] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState<Record<AdminTab, boolean>>({
    cities: false,
    buses: false,
    routes: false,
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
      } else if (targetTab === 'buses') {
        if (!initialLoadDone.cities) {
          setCities(await getCities());
          setInitialLoadDone((s) => ({ ...s, cities: true }));
        }
        setBuses(await getBuses());
      } else {
        if (!initialLoadDone.cities) {
          setCities(await getCities());
          setInitialLoadDone((s) => ({ ...s, cities: true }));
        }
        setRoutes(await getRoutes());
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
    setRouteForm(EMPTY_ROUTE);
  };

  const openEdit = (item: City | Bus | Route) => {
    setModalMode('edit');
    setError(null);
    if (tab === 'cities') {
      const c = item as City;
      setEditId(c.id);
      setCityForm({ name: c.name, province: c.province });
    } else if (tab === 'buses') {
      const b = item as Bus;
      setEditId(b.id);
      setBusForm({
        poName: b.poName,
        busClass: b.class,
        from: b.from,
        to: b.to,
        departure: b.departure,
        arrival: b.arrival,
        price: b.price,
      });
    } else {
      const r = item as Route;
      setEditId(r.id);
      setRouteForm({
        from: r.from,
        to: r.to,
        minPrice: r.minPrice,
        maxPrice: r.maxPrice,
        busCount: r.busCount,
        description: r.description,
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
      } else if (tab === 'buses') {
        if (
          !busForm.poName.trim() ||
          !busForm.busClass.trim() ||
          !busForm.from.trim() ||
          !busForm.to.trim() ||
          !busForm.departure.trim() ||
          !busForm.arrival.trim()
        ) {
          throw new Error('Semua field wajib harus diisi dengan benar');
        }
        if (modalMode === 'create') {
          const created: Bus = {
            id: generateId('BIS', buses),
            poName: busForm.poName.trim(),
            poPhone: '',
            class: busForm.busClass.trim(),
            from: busForm.from.trim(),
            to: busForm.to.trim(),
            departure: busForm.departure.trim(),
            arrival: busForm.arrival.trim(),
            duration: '',
            price: busForm.price,
            seats: { available: 0, total: 0 },
            amenities: [],
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
                  class: busForm.busClass.trim(),
                  from: busForm.from.trim(),
                  to: busForm.to.trim(),
                  departure: busForm.departure.trim(),
                  arrival: busForm.arrival.trim(),
                  price: busForm.price,
                }
              : b
          );
          await saveBuses(next);
          setBuses(next);
          setSuccess('Bis berhasil diperbarui');
        }
      } else if (tab === 'routes') {
        if (!routeForm.from.trim() || !routeForm.to.trim() || !routeForm.description.trim()) {
          throw new Error('Semua field wajib harus diisi dengan benar');
        }
        if (modalMode === 'create') {
          const created: Route = {
            id: generateId('ROUTE', routes),
            from: routeForm.from.trim(),
            to: routeForm.to.trim(),
            minPrice: routeForm.minPrice,
            maxPrice: routeForm.maxPrice,
            busCount: routeForm.busCount,
            description: routeForm.description.trim(),
          };
          const next = [...routes, created];
          await saveRoutes(next);
          setRoutes(next);
          setSuccess('Rute berhasil ditambahkan');
        } else if (modalMode === 'edit' && editId) {
          const next = routes.map((r) =>
            r.id === editId
              ? {
                  ...r,
                  from: routeForm.from.trim(),
                  to: routeForm.to.trim(),
                  minPrice: routeForm.minPrice,
                  maxPrice: routeForm.maxPrice,
                  busCount: routeForm.busCount,
                  description: routeForm.description.trim(),
                }
              : r
          );
          await saveRoutes(next);
          setRoutes(next);
          setSuccess('Rute berhasil diperbarui');
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
      } else if (tab === 'buses') {
        const next = buses.filter((b) => b.id !== id);
        await saveBuses(next);
        setBuses(next);
      } else {
        const next = routes.filter((r) => r.id !== id);
        await saveRoutes(next);
        setRoutes(next);
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
      : tab === 'buses'
        ? modalMode === 'create'
          ? 'Tambah Bis Baru'
          : 'Edit Bis'
        : modalMode === 'create'
          ? 'Tambah Rute Baru'
          : 'Edit Rute';

  const currentList = tab === 'cities' ? cities : tab === 'buses' ? buses : routes;
  const totalAll = useMemo(() => cities.length + buses.length + routes.length, [cities, buses, routes]);
  const statsReady = initialLoadDone.cities && initialLoadDone.buses && initialLoadDone.routes;

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
                  Kelola data kota, bis, dan rute
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            <Button
              onClick={() => {
                setInitialLoadDone({ cities: false, buses: false, routes: false });
                void Promise.all([
                  loadData('cities', true),
                  loadData('buses', true),
                  loadData('routes', true),
                ]);
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

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <Card className="bg-gradient-to-br from-secondary to-background border-secondary/30">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary-foreground/10">
                <RouteIcon className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total Rute
                </p>
                <p className="font-heading text-2xl font-bold text-card-foreground">
                  {statsReady ? routes.length : '—'}
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
                <Button
                  variant={tab === 'routes' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => switchTab('routes')}
                  className="gap-2 h-8"
                >
                  <RouteIcon className="h-4 w-4" />
                  Rute
                  <Badge variant="outline" className="ml-1 h-5 px-1.5 text-[10px]">
                    {initialLoadDone.routes ? routes.length : '?'}
                  </Badge>
                </Button>
              </div>
              <Button onClick={openCreate} className="gap-2 self-start sm:self-auto">
                <Plus className="h-4 w-4" />
                Tambah {tab === 'cities' ? 'Kota' : tab === 'buses' ? 'Bis' : 'Rute'}
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
                  ) : tab === 'buses' ? (
                    <BusIcon className="h-8 w-8" />
                  ) : (
                    <RouteIcon className="h-8 w-8" />
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
                        <th className="px-4 py-3 font-semibold text-muted-foreground">Kelas</th>
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
                            <Badge variant="outline" className="font-normal">{bus.class}</Badge>
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
                {tab === 'routes' && (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-muted-foreground w-28">ID</th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground">Rute</th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground">Harga Range</th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground text-center">Jumlah Bis</th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground">Deskripsi</th>
                        <th className="px-4 py-3 font-semibold text-muted-foreground text-right w-28">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {routes.map((route) => (
                        <tr key={route.id} className="hover:bg-muted/30 align-top">
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{route.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <p className="font-medium text-card-foreground">
                              {route.from}
                              <span className="mx-1 text-muted-foreground">→</span>
                              {route.to}
                            </p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-card-foreground tabular-nums">
                            Rp {route.minPrice.toLocaleString('id-ID')}
                            <span className="mx-1 text-muted-foreground">-</span>
                            Rp {route.maxPrice.toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge variant="secondary">{route.busCount} bis</Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground max-w-xs">{route.description}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="inline-flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(route)} className="h-8 w-8 hover:text-primary" aria-label="Edit rute">
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(route.id)} className="h-8 w-8 hover:text-destructive" aria-label="Hapus rute">
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
              {tab === 'routes' && (
                <RouteFormFields value={routeForm} onChange={setRouteForm} cities={cities} />
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

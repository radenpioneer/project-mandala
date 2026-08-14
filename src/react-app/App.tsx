// PROTOTYPE — three live-dashboard information designs, switchable via ?variant=.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { barX, defineChart } from "@tanstack/charts";
import { Chart } from "@tanstack/charts/react";
import { tooltip } from "@tanstack/charts/tooltip";
import { createColumnHelper, tableFeatures, useTable } from "@tanstack/react-table";
import { scaleBand, scaleLinear } from "d3-scale";
import ReactMap, { AttributionControl, Layer, Marker, NavigationControl, Popup, Source, type FillLayerSpecification, type LineLayerSpecification, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { FeatureCollection, Geometry } from "geojson";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import "./App.css";

type VariantKey = "A" | "B" | "C";
type SceneKey = "live" | "filtered" | "withheld" | "delayed" | "finalizing" | "final";
type ViewKey = "standing" | "pw" | "pd" | "profile" | "themes";

const variants: { key: VariantKey; name: string }[] = [
	{ key: "A", name: "Ringkasan berlapis" },
	{ key: "B", name: "Cerita data" },
	{ key: "C", name: "Panel transparansi" },
];

const scenes: { key: SceneKey; label: string }[] = [
	{ key: "live", label: "Live · global" },
	{ key: "filtered", label: "Live · filter tersedia" },
	{ key: "withheld", label: "Filter · seluruh hasil ditahan" },
	{ key: "delayed", label: "Pembaruan tertunda" },
	{ key: "finalizing", label: "Finalisasi hasil" },
	{ key: "final", label: "Hasil akhir" },
];

const compactResults = [
	{ name: "Ahmad Fauzan", count: "510", percent: "28%", value: 78 },
	{ name: "Budi Santoso", count: null, percent: null, value: 0 },
	{ name: "Citra Lestari", count: "340", percent: "18%", value: 52 },
	{ name: "Dimas Prabowo", count: "465", percent: "25%", value: 70 },
	{ name: "Nama Lain", count: "280", percent: "15%", value: 43 },
	{ name: "Belum Menentukan", count: "220", percent: "12%", value: 34 },
];

const candidateNames = [
	"Ahmad Fauzan", "Bima Ardiansyah", "Candra Wijaya", "Dimas Prabowo", "Eko Ramadhan",
	"Fahri Maulana", "Gilang Pratama", "Hafiz Rahman", "Ilham Akbar", "Jauhar Hidayat",
	"Kurnia Setiawan", "Lukman Hakim", "M. Rizky Ananda", "Naufal Firdaus", "Oki Saputra",
	"Pandu Nugraha", "Qomar Zainuddin", "Rafi Kurniawan", "Satria Mahendra", "Taufik Hidayat",
	"Umar Faruq", "Vicky Pranata", "Wahyu Ramadhan", "Yasir Fadillah", "Zaki Mubarak",
];

const candidateCounts = [500, 460, 420, 380, 340, 310, 285, 260, 240, 220, 200, 180, 165, 150, 135, 120, 105, 95, 85, 75, 65, 55, 45, 35, 25];
const candidateColors = ["#087f6c", "#ca8a2d", "#285f75", "#8d668b", "#6f8d49", "#b75b4b"];
const rankedResults = [
	...candidateNames.map((name, index) => ({ name, count: candidateCounts[index], kind: "candidate" as const })),
	{ name: "Nama Lain", count: 30, kind: "other" as const },
	{ name: "Belum Menentukan", count: 20, kind: "undecided" as const },
].map((result) => ({ ...result, percent: `${Math.round(result.count / 50)}%`, value: result.count / 5 }));
const totalResponses = rankedResults.reduce((total, result) => total + result.count, 0);

const themeRows = [
	{ conclusion: "Rekam jejak organisasi", count: 1240, candidate: "Ahmad Fauzan", comment: "Parafrasa: menginginkan pemimpin yang terbukti mampu mengelola organisasi lintas jenjang." },
	{ conclusion: "Penguatan kaderisasi", count: 1085, candidate: "Bima Ardiansyah", comment: "Parafrasa: berharap kaderisasi kembali konsisten, dekat dengan daerah, dan relevan bagi anggota." },
	{ conclusion: "Kemandirian gerakan", count: 870, candidate: "Candra Wijaya", comment: "Parafrasa: menekankan keberanian menentukan agenda organisasi tanpa ketergantungan eksternal." },
	{ conclusion: "Kolaborasi antarwilayah", count: 645, candidate: "Dimas Prabowo", comment: "Parafrasa: meminta komunikasi pusat dan wilayah yang lebih rutin serta dua arah." },
	{ conclusion: "Transparansi organisasi", count: 510, candidate: "Eko Ramadhan", comment: "Parafrasa: mengharapkan keputusan dan penggunaan sumber daya dijelaskan secara terbuka." },
];

const pdSeeds = [
	["PD Bandung", 500], ["PD Jakarta Selatan", 430], ["PD Surabaya", 400], ["PD Makassar", 350],
	["PD Medan", 340], ["PD Semarang", 310], ["PD Yogyakarta", 280], ["PD Malang", 260],
	["PD Bekasi", 240], ["PD Palembang", 230], ["PD Bogor", 220], ["PD Tangerang", 210],
	["PD Banjarmasin", 200], ["PD Pekanbaru", 190], ["PD Samarinda", 180], ["PD Padang", 170],
	["PD Banda Aceh", 150], ["PD Mataram", 130], ["PD Kendari", 110], ["PD Jayapura", 100],
] as const;

const pdRows = pdSeeds.map(([name, participants], index) => {
	const percentages = [28 + (index % 5), 20 + (index % 4), 13 + (index % 3)];
	const topThree = [index % 6, (index + 2) % 6, (index + 4) % 6].map((candidateIndex, rank) => ({
		name: candidateNames[candidateIndex],
		percent: percentages[rank],
	}));
	return { name, participants, topThree };
});

type PDRow = (typeof pdRows)[number];
const pdTableFeatures = tableFeatures({});
const pdColumnHelper = createColumnHelper<typeof pdTableFeatures, PDRow>();

function PDNameCell({ row, rowIndex }: { row: PDRow; rowIndex: number }) {
	return (
		<span className="pd-tooltip">
			<button aria-describedby={`pd-top-${rowIndex}`}>{row.name}</button>
			<span className="pd-tooltip__card" role="tooltip" id={`pd-top-${rowIndex}`}>
				<b>Top 3</b>
				{row.topThree.map((candidate, rank) => (
					<span key={candidate.name}><i>{rank + 1}</i>{candidate.name}<strong>{candidate.percent}%</strong></span>
				))}
			</span>
		</span>
	);
}

const pdColumns = pdColumnHelper.columns([
	pdColumnHelper.accessor("name", {
		header: "Nama PD",
		cell: (info) => <PDNameCell row={info.row.original} rowIndex={info.row.getDisplayIndex()} />,
	}),
	pdColumnHelper.accessor("participants", {
		header: "Jumlah partisipan",
		cell: (info) => info.getValue().toLocaleString("id-ID"),
	}),
	pdColumnHelper.accessor((row) => row.topThree[0].name, {
		id: "topChoice",
		header: "Pilihan teratas",
	}),
	pdColumnHelper.accessor((row) => row.topThree[0].percent, {
		id: "percent",
		header: "Persentase",
		cell: (info) => <b>{info.getValue()}%</b>,
	}),
]);

const profileCohorts = [
	{ group: "Jenjang", name: "AB1" },
	{ group: "Jenjang", name: "AB2" },
	{ group: "Jenjang", name: "AB3" },
	{ group: "Tingkat Pengurus", name: "Pengurus PW" },
	{ group: "Tingkat Pengurus", name: "Pengurus PD" },
	{ group: "Tingkat Pengurus", name: "Pengurus Komisariat" },
	{ group: "Peran", name: "Ketua" },
	{ group: "Peran", name: "Pengurus" },
	{ group: "Peran", name: "Anggota" },
];

const filterDefinitions = [
	{ key: "pw", label: "PW", options: ["Jawa Barat", "DKI Jakarta", "Jawa Timur"] },
	{ key: "pd", label: "PD", options: ["Bandung", "Jakarta Selatan", "Surabaya"] },
	{ key: "level", label: "Jenjang", options: ["AB1", "AB2", "AB3"] },
	{ key: "board", label: "Tingkat pengurus", options: ["Pengurus PW", "Pengurus PD", "Pengurus Komisariat"] },
	{ key: "role", label: "Peran", options: ["Ketua", "Pengurus", "Anggota"] },
] as const;

type FilterKey = (typeof filterDefinitions)[number]["key"];
type FilterValues = Record<FilterKey, string>;

const emptyFilters: FilterValues = { pw: "", pd: "", level: "", board: "", role: "" };
const filterQueryKeys: Record<FilterKey, string> = { pw: "fpw", pd: "fpd", level: "flevel", board: "fboard", role: "frole" };

function currentSearchParams() {
	return new URLSearchParams(window.location.search);
}

function updateSearchParams(updates: Record<string, string | null>, push = false) {
	const url = new URL(window.location.href);
	for (const [key, value] of Object.entries(updates)) {
		if (value) url.searchParams.set(key, value);
		else url.searchParams.delete(key);
	}
	window.history[push ? "pushState" : "replaceState"]({}, "", url);
}

function filtersFromUrl(scene: SceneKey): FilterValues {
	const params = currentSearchParams();
	const values = { ...emptyFilters };
	for (const definition of filterDefinitions) {
		const requested = params.get(filterQueryKeys[definition.key]);
		if (requested && definition.options.some((option) => option === requested)) values[definition.key] = requested;
	}
	if (!Object.values(values).some(Boolean) && (scene === "filtered" || scene === "withheld")) {
		values.pw = "Jawa Barat";
		values.pd = "Bandung";
	}
	return values;
}

function filterLabels(values: FilterValues) {
	return filterDefinitions.flatMap((definition) => values[definition.key] ? [`${definition.label} ${values[definition.key]}`] : []);
}

function stableHash(value: string) {
	let hash = 0;
	for (const character of value) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
	return hash;
}

function standingForFilters(values: FilterValues) {
	const labels = filterLabels(values);
	if (!labels.length) return { rows: rankedResults, basis: totalResponses, filtered: false };

	const basis = 215;
	const signature = labels.join("|");
	const weighted = rankedResults.map((result) => ({
		...result,
		weight: result.count * (0.82 + (stableHash(`${signature}:${result.name}`) % 37) / 100),
	}));
	const totalWeight = weighted.reduce((total, result) => total + result.weight, 0);
	const rows = weighted.map(({ weight, ...result }) => {
		const count = Math.round((weight / totalWeight * basis) / 5) * 5;
		return { ...result, count, percent: `${Math.round(count / basis * 100)}%`, value: count };
	});
	const candidates = rows.filter((row) => row.kind === "candidate").sort((first, second) => second.count - first.count);
	return { rows: [...candidates, ...rows.filter((row) => row.kind !== "candidate")], basis, filtered: true };
}

function ModalDialog({ labelledBy, className = "", onClose, children }: { labelledBy: string; className?: string; onClose: () => void; children: ReactNode }) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (!dialog.open) dialog.showModal();
		return () => {
			if (dialog.open) dialog.close();
		};
	}, []);

	return (
		<dialog ref={dialogRef} className={`pw-dialog ${className}`} aria-labelledby={labelledBy} onCancel={(event) => { event.preventDefault(); onClose(); }}>
			{children}
		</dialog>
	);
}

function sceneFromUrl(): SceneKey {
	const value = new URLSearchParams(window.location.search).get("state");
	return scenes.some((scene) => scene.key === value) ? (value as SceneKey) : "live";
}

function variantFromUrl(): VariantKey {
	const value = new URLSearchParams(window.location.search).get("variant")?.toUpperCase();
	return variants.some((variant) => variant.key === value) ? (value as VariantKey) : "B";
}

function usePrototypeUrl() {
	const [variant, setVariantState] = useState<VariantKey>(variantFromUrl);
	const [scene, setSceneState] = useState<SceneKey>(sceneFromUrl);

	function update(key: "variant" | "state", value: string) {
		const url = new URL(window.location.href);
		url.searchParams.set(key, value);
		if (key === "state" && value !== "final" && url.searchParams.get("view") === "themes") url.searchParams.set("view", "standing");
		window.history.replaceState({}, "", url);
		if (key === "variant") setVariantState(value as VariantKey);
		else setSceneState(value as SceneKey);
	}

	useEffect(() => {
		const sync = () => {
			setVariantState(variantFromUrl());
			setSceneState(sceneFromUrl());
		};
		window.addEventListener("popstate", sync);
		return () => window.removeEventListener("popstate", sync);
	}, []);

	return {
		variant,
		scene,
		setVariant: (value: VariantKey) => update("variant", value),
		setScene: (value: SceneKey) => update("state", value),
	};
}

function statusFor(scene: SceneKey) {
	if (scene === "final") return { title: "Hasil akhir Survei Preferensi", tone: "final", note: "Selesai ditinjau · revisi privasi 14 Agustus 2026" };
	if (scene === "finalizing") return { title: "Finalisasi hasil", tone: "waiting", note: "Survei ditutup · angka belum final" };
	return { title: "Standing sementara", tone: "live", note: "Survei masih berlangsung · dapat berubah" };
}

function Status({ scene, compact = false }: { scene: SceneKey; compact?: boolean }) {
	const status = statusFor(scene);
	return (
		<div className={`status status--${status.tone} ${compact ? "status--compact" : ""}`} role="status" aria-live="polite">
			<span className="status__dot" aria-hidden="true" />
			<div><strong>{status.title}</strong><span>{status.note}</span></div>
		</div>
	);
}

function RefreshNote({ scene }: { scene: SceneKey }) {
	return scene === "delayed" ? (
		<div className="refresh refresh--delayed"><strong>Pembaruan tertunda</strong><span>Menampilkan snapshot aman terakhir · 14 Agustus 2026, 03.31 WIB</span></div>
	) : (
		<div className="refresh"><span>Diperbarui pada</span><strong>14 Agustus 2026, 03.44 WIB</strong></div>
	);
}

function FilterControls({ scene, compact = false, values, onChange, onReset }: { scene: SceneKey; compact?: boolean; values?: FilterValues; onChange?: (key: FilterKey, value: string) => void; onReset?: () => void }) {
	const [localValues, setLocalValues] = useState<FilterValues>(() => filtersFromUrl(scene));
	const selectedValues = values ?? localValues;
	const hasSelection = Object.values(selectedValues).some(Boolean);

	const changeFilter = (key: FilterKey, value: string) => {
		if (onChange) onChange(key, value);
		else setLocalValues((current) => ({ ...current, [key]: value }));
	};

	const resetFilters = () => {
		if (onReset) onReset();
		else setLocalValues({ ...emptyFilters });
	};

	return (
		<section className={`filters ${compact ? "filters--compact" : ""}`} aria-label="Filter Profil Partisipan">
			<div className="section-heading"><div><span className="eyebrow">Eksplorasi kelompok</span><h2>Filter Profil Partisipan</h2></div><button type="button" className="text-button" disabled={!hasSelection} onClick={resetFilters}>Reset</button></div>
			<div className="filter-grid">
				{filterDefinitions.map((definition) => (
					<label key={definition.key} htmlFor={`filter-${definition.key}`}><span>{definition.label}</span><select id={`filter-${definition.key}`} value={selectedValues[definition.key]} onChange={(event) => changeFilter(definition.key, event.target.value)}><option value="">Semua</option>{definition.options.map((option) => <option key={option}>{option}</option>)}</select></label>
				))}
			</div>
			<p className="microcopy">Satu kelompok ditampilkan sekaligus. Kombinasi kecil dapat ditahan sepenuhnya.</p>
		</section>
	);
}

function ActiveCohort({ scene, values }: { scene: SceneKey; values?: FilterValues }) {
	const labels = values ? filterLabels(values) : (scene === "filtered" || scene === "withheld" ? ["PW Jawa Barat", "PD Bandung"] : []);
	if (!labels.length) return <span className="cohort">Semua partisipan</span>;
	return <div className="active-filters">{labels.map((label) => <span key={label}>{label}</span>)}</div>;
}

function Unavailable({ onClear }: { onClear?: () => void }) {
	return (
		<div className="unavailable" role="status">
			<div className="unavailable__lock" aria-hidden="true">×</div>
			<span className="eyebrow">Seluruh rincian ditahan</span>
			<h3>Data belum cukup</h3>
			<p>Kelompok ini belum mencapai minimum 20 Respons. Tidak ada total kelompok, distribusi, persentase, atau tren yang ditampilkan.</p>
			{onClear && <button type="button" className="secondary-button" onClick={onClear}>Hapus filter</button>}
		</div>
	);
}

function Breakdown({ scene, mode = "bars" }: { scene: SceneKey; mode?: "bars" | "list" | "ledger" }) {
	if (scene === "withheld") return <Unavailable />;
	return (
		<div className={`breakdown breakdown--${mode}`}>
			<div className="breakdown__head"><div><span className="eyebrow">Distribusi preferensi</span><h2>{scene === "filtered" ? "Kelompok terfilter" : "Standing global"}</h2></div><ActiveCohort scene={scene} /></div>
			{scene === "filtered" && <p className="controlled-base">Basis terkontrol: sekitar 215 Respons</p>}
			<div className="result-list">
				{compactResults.map((result) => (
					<div className={`result-row ${!result.count ? "result-row--hidden" : ""}`} key={result.name}>
						<div className="result-row__label"><strong>{result.name}</strong>{result.count ? <span>{result.count} · {result.percent}</span> : <span>Data belum cukup</span>}</div>
						{mode !== "ledger" && <div className="bar" aria-hidden="true"><span style={{ width: result.count ? `${result.value}%` : "0" }} /></div>}
						{mode === "ledger" && <div className="ledger-value">{result.count ? <><b>{result.count}</b><span>{result.percent}</span></> : <b>Ditahan</b>}</div>}
					</div>
				))}
			</div>
			<p className="microcopy">Angka dibulatkan ke 5 terdekat; persentase dari nilai terkontrol. Komponen dapat tidak berjumlah tepat.</p>
		</div>
	);
}

function Total({ quiet = false }: { quiet?: boolean }) {
	return (
		<div className={`total ${quiet ? "total--quiet" : ""}`}>
			<span>Total Respons global</span><strong>{totalResponses.toLocaleString("id-ID")}</strong><small>tepat · termasuk Belum Menentukan</small>
		</div>
	);
}

function StandingPlot({ scene, filters = emptyFilters, onClearFilters }: { scene: SceneKey; filters?: FilterValues; onClearFilters?: () => void }) {
	const [showAll, setShowAllState] = useState(() => currentSearchParams().get("all") === "1");
	const requestedCandidate = currentSearchParams().get("candidate");
	const [selectedCandidate, setSelectedCandidateState] = useState(() => candidateNames.includes(requestedCandidate || "") ? requestedCandidate : null);
	const standing = useMemo(() => standingForFilters(filters), [filters]);
	const plottedRows = useMemo(() => showAll ? standing.rows : [...standing.rows.slice(0, 10), ...standing.rows.slice(-2)], [showAll, standing.rows]);
	const maxCount = Math.max(...plottedRows.map((row) => row.count), 20);

	useEffect(() => {
		const sync = () => {
			const params = currentSearchParams();
			const candidate = params.get("candidate");
			setShowAllState(params.get("all") === "1");
			setSelectedCandidateState(candidate && candidateNames.includes(candidate) ? candidate : null);
		};
		window.addEventListener("popstate", sync);
		return () => window.removeEventListener("popstate", sync);
	}, []);

	const setShowAll = (value: boolean) => {
		updateSearchParams({ all: value ? "1" : null });
		setShowAllState(value);
	};

	const setSelectedCandidate = (name: string | null) => {
		updateSearchParams({ candidate: name }, Boolean(name));
		setSelectedCandidateState(name);
	};

	const standingDefinition = useMemo(() => {
		const responsiveStanding = defineChart(({ width }) => ({
			marks: [barX(plottedRows, {
				id: "standing-preferensi",
				x: "count",
				y: "name",
				key: "name",
				fill: (row) => row.kind === "other" ? "#8d668b" : row.kind === "undecided" ? "#6f8d49" : candidateColors[candidateNames.indexOf(row.name) % candidateColors.length],
				inset: 3,
				radius: 4,
			})],
			x: {
				scale: () => scaleLinear().domain([0, maxCount * 1.04]).nice(),
				label: "Jumlah Respons (dibulatkan ke 5 terdekat)",
				format: (value: number) => value.toLocaleString("id-ID"),
				grid: true,
				ticks: width < 560 ? 3 : 6,
			},
			y: {
				scale: () => scaleBand<string>().domain(plottedRows.map((row) => row.name)).paddingInner(0.16).paddingOuter(0.08),
				},
		}));
		return defineChart(responsiveStanding, {
			keyboard: true,
			focus: "nearest-y",
			tooltip: {
				use: tooltip,
				anchor: "point",
				placement: ["right", "left", "top", "bottom"],
				format: (point) => `${point.datum.name}\n${point.datum.percent} · ${point.datum.count.toLocaleString("id-ID")} Respons`,
			},
		});
	}, [maxCount, plottedRows]);

	if (scene === "withheld" && standing.filtered) return <Unavailable onClear={onClearFilters} />;
	return (
		<div className="standing-plot">
			<div className="standing-plot__meta">
				<ActiveCohort scene={scene} values={filters} />
				<span><b>{standing.basis.toLocaleString("id-ID")}</b> Respons {standing.filtered ? "kelompok · dibulatkan" : "global · tepat"}</span>
			</div>
			{standing.filtered && <p className="controlled-base">Basis terkontrol: sekitar {standing.basis.toLocaleString("id-ID")} Respons</p>}
			<div className="standing-chart">
				<Chart
					definition={standingDefinition}
					height={Math.max(500, plottedRows.length * 38)}
					initialWidth={920}
					ariaLabel={`Standing preferensi ${standing.filtered ? "kelompok terfilter" : "global"}, diurutkan dari jumlah Respons terbesar`}
					ariaDescription="Diagram batang horizontal dengan jumlah Respons dibulatkan. Klik label atau batang kandidat untuk membuka detail. Gunakan tombol panah lalu Enter atau Spasi untuk membuka detail dengan keyboard."
					onSelect={(point) => { if (point?.datum.kind === "candidate") setSelectedCandidate(point.datum.name); }}
				/>
			</div>
			<button className="show-results" aria-expanded={showAll} onClick={() => setShowAll(!showAll)}>{showAll ? "Tampilkan ringkas" : "Tampilkan semua 25 kandidat"}</button>
			<p className="microcopy">Klik label atau batang kandidat untuk membuka detail. Angka dibulatkan ke 5 terdekat; persentase dari nilai terkontrol.</p>
			<p className="standing-disclosure">Data simulasi. Partisipasi self-selected dan status kader tidak diverifikasi; satu nomor WhatsApp tidak membuktikan satu kader unik. Project Mandala independen, tidak resmi, dan non-binding.</p>
			{selectedCandidate && <CandidateDialog name={selectedCandidate} onClose={() => setSelectedCandidate(null)} />}
		</div>
	);
}

function ThemeTable() {
	return (
		<div className="theme-table-wrap">
			<div className="theme-table-meta"><span>Hanya setelah penutupan</span><span>Ditinjau Project Maintainer · multi-label</span></div>
			<table className="theme-table">
				<caption className="sr-only">Kesimpulan Alasan dan Harapan setelah tinjauan Project Maintainer</caption>
				<thead><tr><th scope="col">Kesimpulan</th><th scope="col">Jumlah Pendapat Partisipan</th><th scope="col">Top Candidate</th><th scope="col">Featured Comment</th></tr></thead>
				<tbody>{themeRows.map((row) => <tr key={row.conclusion}><th scope="row">{row.conclusion}</th><td>{row.count.toLocaleString("id-ID")}</td><td>{row.candidate}</td><td>{row.comment}<small>Bukan kutipan</small></td></tr>)}</tbody>
			</table>
			<p className="microcopy">Jumlah memakai Respons dengan teks yang dapat dikodekan. Satu Respons dapat masuk lebih dari satu kesimpulan. Top Candidate menunjukkan pilihan terbanyak di antara Respons yang terkait dengan kesimpulan tersebut.</p>
		</div>
	);
}

function PDTable() {
	const table = useTable({ features: pdTableFeatures, columns: pdColumns, data: pdRows, getRowId: (row) => row.name });
	return (
		<div className="pd-table-wrap">
			<div className="pd-table-meta"><span>{pdRows.length} PD simulasi</span><span>{pdRows.reduce((total, row) => total + row.participants, 0).toLocaleString("id-ID")} partisipan</span></div>
			<table className="pd-table">
				<caption className="sr-only">Ringkasan Standing per PD dengan data simulasi</caption>
				<thead>{table.getHeaderGroups().map((group) => (
					<tr key={group.id}>{group.headers.map((header) => <th scope="col" key={header.id}>{header.isPlaceholder ? null : <table.FlexRender header={header} />}</th>)}</tr>
				))}</thead>
				<tbody>{table.getRowModel().rows.map((row) => (
					<tr key={row.id}>{row.getAllCells().map((cell) => cell.column.id === "name"
						? <th scope="row" key={cell.id}><table.FlexRender cell={cell} /></th>
						: <td key={cell.id}><table.FlexRender cell={cell} /></td>)}</tr>
				))}</tbody>
			</table>
			<p className="microcopy">Arahkan kursor atau fokuskan nama PD untuk melihat Top 3. Data seluruhnya simulasi.</p>
		</div>
	);
}

function Trend({ scene, compact = false }: { scene: SceneKey; compact?: boolean }) {
	if (scene === "withheld") return null;
	return (
		<section className={`trend ${compact ? "trend--compact" : ""}`}>
			<div className="section-heading"><div><span className="eyebrow">Tren global · harian</span><h2>Partisipasi terus bertambah</h2></div><span className="trend-key"><i /> Respons kumulatif</span></div>
			<svg viewBox="0 0 600 170" role="img" aria-label="Tren global harian menunjukkan partisipasi kumulatif bertambah dari 3 sampai 14 Agustus">
				<path className="gridline" d="M20 25H580M20 75H580M20 125H580" />
				<path className="trend-area" d="M20 135 C80 130 90 118 140 114 S220 98 260 92 S345 70 390 66 S470 46 580 25 L580 150 L20 150Z" />
				<path className="trend-line" d="M20 135 C80 130 90 118 140 114 S220 98 260 92 S345 70 390 66 S470 46 580 25" />
			</svg>
			<div className="trend-axis"><span>3 Agu</span><span>8 Agu</span><span>14 Agu</span></div>
			<p className="microcopy">Edit dan moderasi dapat merevisi garis preferensi kini dan historis. Tren terfilter tidak dipublikasikan.</p>
		</section>
	);
}

function Limitations({ full = false }: { full?: boolean }) {
	return (
		<aside className={`limitations ${full ? "limitations--full" : ""}`}>
			<span className="eyebrow">Baca dengan batasan ini</span>
			<h2>Batas interpretasi</h2>
			<p>Partisipasi bersifat self-selected. Status kader tidak diverifikasi. Satu nomor WhatsApp bukan bukti satu kader unik.</p>
			{full && <p>Project Mandala independen, tidak didukung PP KAMMI, non-binding, dan tidak mengukur seluruh kader KAMMI.</p>}
			<a href="#metode">Baca metode lengkap <span aria-hidden="true">↗</span></a>
		</aside>
	);
}

function Themes({ scene }: { scene: SceneKey }) {
	if (scene !== "final") return null;
	return (
		<section className="themes">
			<div className="section-heading"><div><span className="eyebrow">Tinjauan setelah penutupan</span><h2>Tema Alasan dan Harapan</h2></div><span className="reviewed">Ditinjau Project Maintainer</span></div>
			<div className="theme-grid"><article><b>Alasan</b><strong>Rekam jejak organisasi</strong><p>46% dari Respons dengan teks yang dapat dikodekan</p></article><article><b>Harapan</b><strong>Penguatan kaderisasi</strong><p>54% dari Respons dengan teks yang dapat dikodekan</p></article></div>
			<p className="microcopy">Multi-label; proporsi dapat melebihi 100%. Tidak ada kutipan atau teks mentah yang dipublikasikan.</p>
		</section>
	);
}

function Brand() {
	return <a className="brand" href="#top"><span className="brand__mark">M</span><span><b>Project Mandala</b><small>Survei Preferensi Muktamar XIV</small></span></a>;
}

function VariantA({ scene }: { scene: SceneKey }) {
	return (
		<div className="variant variant-a">
			<header className="topbar"><Brand /><a href="#metode">Metode & privasi</a></header>
			<main>
				<div className="a-intro"><div><span className="kicker">Survei independen · tidak resmi</span><h1>Apa yang dipilih partisipan saat ini?</h1><p>Ringkasan berjalan dari Respons yang masuk. Urutan nama alfabetis, bukan peringkat.</p></div><Status scene={scene} /></div>
				<RefreshNote scene={scene} />
				<div className="a-summary"><Total /><Limitations /></div>
				<FilterControls scene={scene} />
				<div className="a-content"><Breakdown scene={scene} /><Trend scene={scene} compact /></div>
				<Themes scene={scene} />
			</main>
			<footer id="metode">Project Mandala · data simulasi untuk prototipe</footer>
		</div>
	);
}

const pwSeeds: [string, string, number, number, number, number | null][] = [
	["Aceh", "AC", 72, 55, 120, 0], ["Sumatera Utara", "SU", 96, 78, 240, 0], ["Sumatera Barat", "SB", 111, 112, 130, 1],
	["Riau", "RI", 139, 92, 150, 2], ["Kepulauan Riau", "KR", 181, 91, 90, 1], ["Jambi", "JA", 144, 122, 95, 3],
	["Sumatera Selatan", "SS", 164, 145, 170, 0], ["Bengkulu", "BE", 126, 151, 70, 4], ["Lampung", "LA", 177, 176, 155, 2],
	["Kep. Bangka Belitung", "BB", 207, 137, 65, 5], ["Banten", "BT", 238, 201, 210, 1], ["DKI Jakarta", "JK", 258, 194, 360, 0],
	["Jawa Barat", "JB", 283, 202, 709, 0], ["Jawa Tengah", "JT", 329, 207, 460, 2], ["DI Yogyakarta", "YO", 349, 220, 135, 3],
	["Jawa Timur", "JI", 395, 208, 550, 1], ["Bali", "BA", 432, 214, 85, 4], ["Nusa Tenggara Barat", "NB", 466, 218, 100, 5],
	["Nusa Tenggara Timur", "NT", 519, 222, 80, 2], ["Kalimantan Barat", "KB", 300, 91, 105, 3],
	["Kalimantan Tengah", "KT", 350, 112, 90, 0], ["Kalimantan Selatan", "KS", 379, 147, 110, 4],
	["Kalimantan Timur–Utara", "KU", 405, 77, 145, 1], ["Sulawesi Utara", "SA", 521, 76, 75, 5],
	["Gorontalo", "GO", 494, 96, 50, 2], ["Sulawesi Tengah", "ST", 471, 122, 70, 3], ["Sulawesi Barat", "SR", 452, 146, 9, null],
	["Sulawesi Selatan", "SN", 479, 172, 210, 0], ["Sulawesi Tenggara", "SG", 520, 151, 65, 4],
	["Maluku", "MA", 601, 144, 9, null], ["Maluku Utara", "MU", 595, 96, 8, null], ["Papua", "PA", 748, 134, 80, 1],
];

const pwRegions = pwSeeds.map(([name, code, x, y, participants, winner]) => ({
	name: `PW ${name}`, code, participants,
	longitude: 95 + (x - 72) / (748 - 72) * 46,
	latitude: 6 - (y - 55) / (222 - 55) * 14,
	candidate: winner === null ? null : candidateNames[winner],
	color: winner === null ? "#aeb7b0" : candidateColors[winner],
}));
const totalPWParticipants = pwRegions.reduce((total, region) => total + region.participants, 0);

function topFiveForPW(winner: number | null, seed: number) {
	if (winner === null) return [];
	const percentages = [30 + (seed % 4), 23 + (seed % 3), 17 + (seed % 2), 13, 8];
	return [winner, winner + 1, winner + 2, winner + 3, winner + 4].map((candidateIndex, rank) => ({
		name: candidateNames[candidateIndex % candidateNames.length],
		percent: percentages[rank],
	}));
}

const indonesiaBounds: [number, number, number, number] = [94.4, -11.6, 141.6, 6.6];
const provinceGeoJsonUrl = "https://raw.githubusercontent.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces/main/GeoJSON/indonesia-38-provinces.geojson";

type ProvinceSourceProperties = {
	PROVINSI: string;
	pwCode: string;
	fillColor: string;
	withheld: boolean;
	label: string;
};

type ProvinceSourceData = FeatureCollection<Geometry, ProvinceSourceProperties>;
let provinceGeoJsonPromise: Promise<ProvinceSourceData> | null = null;

const provinceToPWCode: Record<string, string> = {
	"Sulawesi Tengah": "ST", "Sulawesi Barat": "SR", "Sulawesi Selatan": "SN", "Papua Tengah": "PA", "Papua Barat": "PA",
	Gorontalo: "GO", Riau: "RI", "Papua Selatan": "PA", "Daerah Istimewa Yogyakarta": "YO", "Sumatera Barat": "SB",
	"DKI Jakarta": "JK", Maluku: "MA", Bengkulu: "BE", Lampung: "LA", Papua: "PA", "Kepulauan Riau": "KR",
	"Nusa Tenggara Barat": "NB", Jambi: "JA", Bali: "BA", "Jawa Timur": "JI", "Papua Barat Daya": "PA", "Sumatera Utara": "SU",
	"Sulawesi Tenggara": "SG", "Nusa Tenggara Timur": "NT", "Kalimantan Selatan": "KS", Aceh: "AC", "Kalimantan Tengah": "KT",
	"Papua Pegunungan": "PA", "Kepulauan Bangka Belitung": "BB", "Sumatera Selatan": "SS", Banten: "BT", "Sulawesi Utara": "SA",
	"Kalimantan Utara": "KU", "Kalimantan Timur": "KU", "Jawa Tengah": "JT", "Maluku Utara": "MU", "Kalimantan Barat": "KB", "Jawa Barat": "JB",
};

const pwRegionByCode = new Map(pwRegions.map((region) => [region.code, region]));

function regionMapLabel(region: (typeof pwRegions)[number]) {
	return region.candidate
		? `${region.name}: ${region.candidate} terkuat, ${region.participants} partisipan`
		: `${region.name}: data belum cukup, ${region.participants} partisipan`;
}

function loadProvinceGeoJson() {
	provinceGeoJsonPromise ??= fetch(provinceGeoJsonUrl)
		.then(async (response) => {
			if (!response.ok) throw new Error(`GeoJSON gagal dimuat (${response.status})`);
			const geoJson = await response.json() as FeatureCollection<Geometry, { PROVINSI?: string }>;
			return {
				type: "FeatureCollection" as const,
				features: geoJson.features.map((feature) => {
					const provinceName = String(feature.properties?.PROVINSI ?? "Wilayah");
					const region = pwRegionByCode.get(provinceToPWCode[provinceName]);
					return {
						...feature,
						properties: {
							PROVINSI: provinceName,
							pwCode: region?.code ?? "",
							fillColor: region?.color ?? "#aeb7b0",
							withheld: !region?.candidate,
							label: region ? regionMapLabel(region) : `${provinceName}: belum dipetakan ke PW`,
						},
					};
				}),
			};
		})
		.catch((error: unknown) => {
			provinceGeoJsonPromise = null;
			throw error;
		});
	return provinceGeoJsonPromise;
}

let maplibrePromise: Promise<typeof import("maplibre-gl")> | null = null;

function loadMapLibre() {
	maplibrePromise ??= import("maplibre-gl").then((maplibre) => {
		maplibre.setWorkerUrl(maplibreWorkerUrl);
		return maplibre;
	});
	return maplibrePromise;
}

const openFreeMapStyleUrl = "https://tiles.openfreemap.org/styles/positron";

const provinceFillLayer: FillLayerSpecification = {
	id: "pw-provinces-fill",
	type: "fill",
	source: "pw-provinces",
	paint: {
		"fill-color": ["coalesce", ["get", "fillColor"], "#aeb7b0"],
		"fill-opacity": ["case", ["==", ["get", "withheld"], true], 0.48, 0.82],
	},
};

const provinceLineLayer: LineLayerSpecification = {
	id: "pw-provinces-line",
	type: "line",
	source: "pw-provinces",
	paint: { "line-color": "#ffffff", "line-width": 1.25 },
};

const withheldLineLayer: LineLayerSpecification = {
	id: "pw-provinces-withheld-line",
	type: "line",
	source: "pw-provinces",
	filter: ["==", ["get", "withheld"], true],
	paint: { "line-color": "#65716a", "line-dasharray": [3, 2], "line-width": 1.35 },
};

const interactiveMapLayers = [provinceFillLayer.id];
const mapAttribution = '<a href="https://github.com/denyherianto/indonesia-geojson-topojson-maps-with-38-provinces">Batas provinsi · CC BY 4.0</a>';

function MapLibreCoverageMap({ selectedPWCode, onSelectPW }: { selectedPWCode: string | null; onSelectPW: (region: (typeof pwRegions)[number]) => void }) {
	const [geoJson, setGeoJson] = useState<ProvinceSourceData | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [loadAttempt, setLoadAttempt] = useState(0);
	const [rendererReady, setRendererReady] = useState(false);
	const [hoverInfo, setHoverInfo] = useState<{ longitude: number; latitude: number; label: string } | null>(null);
	const selectedLineLayer = useMemo<LineLayerSpecification>(() => ({
		id: "pw-provinces-selected-line",
		type: "line",
		source: "pw-provinces",
		filter: ["==", ["get", "pwCode"], selectedPWCode ?? "__none__"],
		paint: { "line-color": "#162024", "line-width": 3 },
	}), [selectedPWCode]);

	useEffect(() => {
		let active = true;
		void loadProvinceGeoJson()
			.then((data) => { if (active) setGeoJson(data); })
			.catch((error: unknown) => {
				if (active) setLoadError(error instanceof Error ? error.message : "Batas wilayah gagal dimuat");
			});
		return () => { active = false; };
	}, [loadAttempt]);

	const handleMapClick = (event: MapLayerMouseEvent) => {
		const code = String(event.features?.[0]?.properties?.pwCode ?? "");
		const region = pwRegionByCode.get(code);
		if (region) onSelectPW(region);
	};

	const handleMapHover = (event: MapLayerMouseEvent) => {
		const label = String(event.features?.[0]?.properties?.label ?? "");
		if (!label) return setHoverInfo(null);
		setHoverInfo({ longitude: event.lngLat.lng, latitude: event.lngLat.lat, label });
	};

	return (
		<div className="maplibre-map-shell" aria-busy={!loadError && (!rendererReady || !geoJson)}>
			<ReactMap
				key={loadAttempt}
				mapLib={loadMapLibre()}
				mapStyle={openFreeMapStyleUrl}
				initialViewState={{ bounds: indonesiaBounds, fitBoundsOptions: { padding: 20, maxZoom: 4.75 } }}
				maxBounds={indonesiaBounds}
				minZoom={3}
				maxZoom={7}
				renderWorldCopies={false}
				scrollZoom={false}
				dragRotate={false}
				touchPitch={false}
				attributionControl={false}
				interactiveLayerIds={geoJson ? interactiveMapLayers : []}
				cursor={hoverInfo ? "pointer" : "grab"}
				onClick={handleMapClick}
				onMouseMove={handleMapHover}
				onMouseLeave={() => setHoverInfo(null)}
				onLoad={() => setRendererReady(true)}
				onError={(event) => setLoadError(event.error.message || "Renderer peta gagal dimuat")}
			>
				{geoJson && (
					<Source id="pw-provinces" type="geojson" data={geoJson}>
						<Layer {...provinceFillLayer} />
						<Layer {...provinceLineLayer} />
						<Layer {...withheldLineLayer} />
						<Layer {...selectedLineLayer} />
					</Source>
				)}
				{pwRegions.map((region) => (
					<Marker key={region.code} longitude={region.longitude} latitude={region.latitude} anchor="center">
						<button
							type="button"
							className="pw-map-keyboard-marker"
							aria-label={`Pilih ${region.name}: ${regionMapLabel(region)}`}
							aria-pressed={selectedPWCode === region.code}
							onClick={() => onSelectPW(region)}
						/>
					</Marker>
				))}
				<NavigationControl position="top-left" showCompass={false} />
				<AttributionControl position="bottom-right" compact customAttribution={mapAttribution} />
				{hoverInfo && <Popup longitude={hoverInfo.longitude} latitude={hoverInfo.latitude} closeButton={false} closeOnClick={false} offset={12} className="pw-area-tooltip">{hoverInfo.label}</Popup>}
			</ReactMap>
			{(!rendererReady || !geoJson) && !loadError && <p className="map-load-status" role="status">Menyiapkan peta wilayah…</p>}
			{loadError && <div className="map-load-error" role="alert"><span>{loadError}.</span><button type="button" onClick={() => { setLoadError(null); setRendererReady(false); setLoadAttempt((attempt) => attempt + 1); }}>Coba lagi</button></div>}
		</div>
	);
}

function RegionMap() {
	const requestedPW = currentSearchParams().get("pw");
	const [selectedPW, setSelectedPWState] = useState(() => pwRegions.find((region) => region.code === requestedPW || region.name === requestedPW) || null);
	const selectedSeed = selectedPW ? pwSeeds.findIndex((seed) => seed[1] === selectedPW.code) : -1;
	const topFive = selectedPW ? topFiveForPW(pwSeeds[selectedSeed][5], selectedSeed) : [];

	useEffect(() => {
		const sync = () => {
			const requested = currentSearchParams().get("pw");
			setSelectedPWState(pwRegions.find((region) => region.code === requested || region.name === requested) || null);
		};
		window.addEventListener("popstate", sync);
		return () => window.removeEventListener("popstate", sync);
	}, []);

	const setSelectedPW = (region: (typeof pwRegions)[number] | null) => {
		updateSearchParams({ pw: region?.code ?? null }, Boolean(region));
		setSelectedPWState(region);
	};

	return (
			<div className="region-map">
				<div className="region-map__meta"><span>{pwRegions.length} PW · {totalPWParticipants.toLocaleString("id-ID")} partisipan</span><span>Warna menunjukkan kandidat terkuat</span></div>
				<div className="candidate-legend">{candidateColors.map((color, index) => <span key={color}><i style={{ background: color }} />{candidateNames[index]}</span>)}<span><i className="legend-unavailable" />Data belum cukup</span></div>

				<div className="maplibre-map-frame" role="group" aria-labelledby="pw-map-instructions">
					<MapLibreCoverageMap selectedPWCode={selectedPW?.code ?? null} onSelectPW={setSelectedPW} />
				</div>
				<p id="pw-map-instructions" className="microcopy">Klik wilayah pada peta untuk membuka detail. Dengan keyboard, fokuskan peta lalu tekan Tab hingga nama PW yang dituju dan tekan Enter. PW dengan cohort di bawah 10 ditampilkan abu-abu; warna menunjukkan kandidat terkuat, bukan margin kemenangan atau representasi seluruh kader.</p>
				{selectedPW && (
					<ModalDialog labelledBy="pw-dialog-title" onClose={() => setSelectedPW(null)}>
							<button className="pw-dialog__close" autoFocus onClick={() => setSelectedPW(null)} aria-label="Tutup detail PW">×</button>
						<span className="eyebrow">Per PW · data simulasi</span>
						<h2 id="pw-dialog-title">{selectedPW.name}</h2>
						<p>{selectedPW.participants.toLocaleString("id-ID")} partisipan</p>
						{topFive.length ? (
							<ol className="pw-top-five">{topFive.map((candidate, rank) => <li key={candidate.name}><i>{rank + 1}</i><span><b>{candidate.name}</b><small><span style={{ width: `${candidate.percent}%` }} /></small></span><strong>{candidate.percent}%</strong></li>)}</ol>
						) : (
							<div className="pw-dialog__withheld"><b>Data belum cukup</b><span>Top 5 ditahan karena cohort di bawah 10 partisipan.</span></div>
						)}
						<p className="microcopy">Persentase dari nilai terkontrol dan dibulatkan. Sisa pilihan tidak ditampilkan.</p>
					</ModalDialog>
				)}
		</div>
	);
}

function CandidateDialog({ name, onClose }: { name: string; onClose: () => void }) {
	const candidateIndex = candidateNames.indexOf(name);
	const safeRegions = pwRegions.filter((region) => region.participants >= 10);
	const topPW = safeRegions[(candidateIndex * 7) % safeRegions.length];
	const topPD = pdRows[(candidateIndex * 3) % pdRows.length];
	const reasons = [0, 1, 2].map((offset) => themeRows[(candidateIndex + offset) % themeRows.length]);
	const standing = rankedResults[candidateIndex];
	return (
		<ModalDialog labelledBy="candidate-dialog-title" className="candidate-dialog" onClose={onClose}>
				<button className="pw-dialog__close" autoFocus onClick={onClose} aria-label="Tutup detail kandidat">×</button>
				<span className="eyebrow">Profil bakal kandidat · data simulasi</span>
				<h2 id="candidate-dialog-title">{name}</h2>
				<p>Peringkat {candidateIndex + 1} · {standing.percent} · {standing.count.toLocaleString("id-ID")} partisipan</p>
				<div className="candidate-highlights">
					<article><span>Top PW</span><b>{topPW.name.replace("PW ", "")}</b><strong>{24 + (candidateIndex % 9)}%</strong></article>
					<article><span>Top PD</span><b>{topPD.name.replace("PD ", "")}</b><strong>{26 + (candidateIndex % 8)}%</strong></article>
				</div>
				<div className="candidate-reasons">
					<span className="eyebrow">Top 3 Alasan dan Harapan</span>
					<ol>{reasons.map((reason, index) => <li key={reason.conclusion}><i>{index + 1}</i><span><b>{reason.conclusion}</b><small>{reason.comment.replace("Parafrasa: ", "")}</small></span></li>)}</ol>
				</div>
				<p className="microcopy">Parafrasa sintetis untuk menguji informasi; bukan kutipan partisipan.</p>
		</ModalDialog>
	);
}

function ProfileCard({ cohort, cohortIndex }: { cohort: typeof profileCohorts[number]; cohortIndex: number }) {
	const topFive = [0, 1, 2, 3, 4].map((offset) => {
		const candidateIndex = (cohortIndex * 3 + offset) % candidateNames.length;
		return { name: candidateNames[candidateIndex], percent: [29, 24, 18, 13, 9][offset] - (cohortIndex % 3) };
	});
	return (
		<article className="profile-card">
			<header><div><span className="eyebrow">{cohort.group}</span><h2>{cohort.name}</h2></div></header>
			<ol>{topFive.map((candidate, index) => <li key={candidate.name}><i>{index + 1}</i><span><b>{candidate.name}</b><small><span style={{ width: `${candidate.percent * 2.6}%` }} /></small></span><strong>{candidate.percent}%</strong></li>)}</ol>
		</article>
	);
}

function ProfileCards() {
	return (
		<div className="profile-panel">
			<div className="profile-panel__meta"><span>{profileCohorts.length} cohort · data simulasi</span><span>Top 5 per kartu</span></div>
			<div className="profile-grid">{profileCohorts.map((cohort, index) => <ProfileCard key={`${cohort.group}-${cohort.name}`} cohort={cohort} cohortIndex={index} />)}</div>
			<p className="microcopy">Setiap kartu mewakili satu cohort. Persentase dari nilai terkontrol dan dibulatkan.</p>
		</div>
	);
}

function VariantB({ scene }: { scene: SceneKey }) {
	const requestedView = currentSearchParams().get("view");
	const [view, setViewState] = useState<ViewKey>(requestedView === "pw" || requestedView === "pd" || requestedView === "profile" || (requestedView === "themes" && scene === "final") ? requestedView : "standing");
	const [filterValues, setFilterValues] = useState<FilterValues>(() => filtersFromUrl(scene));
	const activeView = view === "themes" && scene !== "final" ? "standing" : view;
	const activeFilterLabels = filterLabels(filterValues);

	useEffect(() => {
		const sync = () => {
			const requested = currentSearchParams().get("view");
			setViewState(requested === "pw" || requested === "pd" || requested === "profile" || (requested === "themes" && scene === "final") ? requested : "standing");
			setFilterValues(filtersFromUrl(scene));
		};
		window.addEventListener("popstate", sync);
		return () => window.removeEventListener("popstate", sync);
	}, [scene]);

	const setView = (nextView: ViewKey) => {
		updateSearchParams({ view: nextView, candidate: null, pw: null }, true);
		setViewState(nextView);
	};

	const changeFilter = (key: FilterKey, value: string) => {
		setFilterValues((current) => ({ ...current, [key]: value }));
		updateSearchParams({ [filterQueryKeys[key]]: value || null });
	};

	const resetFilters = () => {
		setFilterValues({ ...emptyFilters });
		updateSearchParams(Object.fromEntries(Object.values(filterQueryKeys).map((key) => [key, null])));
	};

	return (
			<div id="top" className={`variant variant-b${import.meta.env.DEV ? " variant-b--prototype" : ""}`}>
				<a href="#dashboard-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-teal-900">Lewati ke isi dashboard</a>
				<header className="b-nav"><Brand /><Status scene={scene} compact /></header>
				<main id="dashboard-content" tabIndex={-1}>
					<h1 className="sr-only">Standing Survei Preferensi Project Mandala</h1>
					<section className="b-dashboard-hero">
						<nav className="data-tabs" aria-label="Tampilan dashboard">
							<button aria-pressed={activeView === "standing"} className={activeView === "standing" ? "active" : ""} onClick={() => setView("standing")}>Standing</button>
							<button aria-pressed={activeView === "pw"} className={activeView === "pw" ? "active" : ""} onClick={() => setView("pw")}>Per PW</button>
							<button aria-pressed={activeView === "pd"} className={activeView === "pd" ? "active" : ""} onClick={() => setView("pd")}>Per PD</button>
							<button aria-pressed={activeView === "profile"} className={activeView === "profile" ? "active" : ""} onClick={() => setView("profile")}>Profil</button>
								<button aria-pressed={activeView === "themes"} className={activeView === "themes" ? "active" : ""} disabled={scene !== "final"} onClick={() => setView("themes")}>Alasan dan Harapan {scene !== "final" && "· setelah final"}</button>
					</nav>
					{activeView === "standing" && <>
							<StandingPlot scene={scene} filters={filterValues} onClearFilters={resetFilters} />
							<details className="b-filter-panel">
								<summary><span><b>Filter Profil Partisipan</b><small>{activeFilterLabels.length ? activeFilterLabels.join(" · ") : "Semua partisipan"}</small></span><span aria-hidden="true">＋</span></summary>
								<FilterControls scene={scene} compact values={filterValues} onChange={changeFilter} onReset={resetFilters} />
						</details>
					</>}
					{activeView === "pw" && <RegionMap />}
					{activeView === "pd" && <PDTable />}
					{activeView === "profile" && <ProfileCards />}
					{activeView === "themes" && <ThemeTable />}
				</section>
			</main>
				<footer id="metode">
					<p>Data simulasi · Project Mandala independen, tidak resmi, dan non-binding.</p>
					<details><summary>Metode & privasi</summary><p>Standing berasal dari Respons self-selected. Status kader dan satu-kader-satu-nomor tidak diverifikasi. Total global tampil tepat; rincian dapat dibulatkan atau ditahan. Teks mentah Alasan dan Harapan tidak dipublikasikan.</p></details>
				</footer>
		</div>
	);
}

function VariantC({ scene }: { scene: SceneKey }) {
	return (
		<div className="variant variant-c">
			<header className="c-header"><Brand /><div><Status scene={scene} compact /><RefreshNote scene={scene} /></div></header>
			<main className="c-shell">
				<aside className="c-rail"><span className="kicker">Snapshot publik</span><Total quiet /><nav><a href="#standing">01 Standing</a><a href="#filter">02 Filter</a><a href="#trend">03 Tren</a><a href="#metode">04 Metode</a></nav><Limitations full /></aside>
				<div className="c-main">
					<section className="c-title"><span className="eyebrow">Catatan data publik</span><h1>Standing Survei Preferensi</h1><p>Deskriptif, terkendali, dan dapat diaudit batasannya. Bukan papan skor.</p></section>
					<section id="standing" className="c-module"><div className="module-number">01</div><Breakdown scene={scene} mode="ledger" /></section>
					<section id="filter" className="c-module"><div className="module-number">02</div><FilterControls scene={scene} compact /></section>
					<section id="trend" className="c-module"><div className="module-number">03</div><Trend scene={scene} compact /></section>
					<Themes scene={scene} />
					<section id="metode" className="c-method"><b>Metode ringkas</b><p>Hanya total Respons global tampil tepat. Rincian lain dibulatkan atau ditahan melalui Kontrol Pengungkapan.</p><a href="#top">Metode lengkap ↗</a></section>
				</div>
			</main>
		</div>
	);
}

function PrototypeSwitcher({ variant, scene, setVariant, setScene }: ReturnType<typeof usePrototypeUrl>) {
	useEffect(() => {
		const onKey = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement;
			if (target.matches("input, textarea, select, [contenteditable]")) return;
			if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
			const current = variants.findIndex((item) => item.key === variant);
			const offset = event.key === "ArrowLeft" ? -1 : 1;
			setVariant(variants[(current + offset + variants.length) % variants.length].key);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [setVariant, variant]);

	const current = variants.findIndex((item) => item.key === variant);
	const move = (offset: number) => setVariant(variants[(current + offset + variants.length) % variants.length].key);
	return (
		<div className="prototype-controls" aria-label="Kontrol prototipe">
			<label>Kondisi uji<select value={scene} onChange={(event) => setScene(event.target.value as SceneKey)}>{scenes.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}</select></label>
			<div className="variant-switcher"><button onClick={() => move(-1)} aria-label="Varian sebelumnya">←</button><span><b>{variant}</b> — {variants[current].name}</span><button onClick={() => move(1)} aria-label="Varian berikutnya">→</button></div>
		</div>
	);
}

function App() {
	const controls = usePrototypeUrl();
	return (
		<>
			{controls.variant === "A" && <VariantA key={controls.scene} scene={controls.scene} />}
			{controls.variant === "B" && <VariantB key={controls.scene} scene={controls.scene} />}
			{controls.variant === "C" && <VariantC key={controls.scene} scene={controls.scene} />}
			{!import.meta.env.PROD && <PrototypeSwitcher {...controls} />}
		</>
	);
}

export default App;

// PROTOTYPE — three live-dashboard information designs, switchable via ?variant=.
import { useEffect, useState, type CSSProperties } from "react";
import "./App.css";

type VariantKey = "A" | "B" | "C";
type SceneKey = "live" | "filtered" | "withheld" | "delayed" | "finalizing" | "final";

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

const filters = ["PW", "PD", "Jenjang", "Tingkat pengurus", "Peran"];

function sceneFromUrl(): SceneKey {
	const value = new URLSearchParams(window.location.search).get("state");
	return scenes.some((scene) => scene.key === value) ? (value as SceneKey) : "live";
}

function variantFromUrl(): VariantKey {
	const value = new URLSearchParams(window.location.search).get("variant")?.toUpperCase();
	return variants.some((variant) => variant.key === value) ? (value as VariantKey) : "A";
}

function usePrototypeUrl() {
	const [variant, setVariantState] = useState<VariantKey>(variantFromUrl);
	const [scene, setSceneState] = useState<SceneKey>(sceneFromUrl);

	function update(key: "variant" | "state", value: string) {
		const url = new URL(window.location.href);
		url.searchParams.set(key, value);
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
		<div className={`status status--${status.tone} ${compact ? "status--compact" : ""}`}>
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

function FilterControls({ scene, compact = false }: { scene: SceneKey; compact?: boolean }) {
	const selected = scene === "filtered" || scene === "withheld";
	return (
		<section className={`filters ${compact ? "filters--compact" : ""}`} aria-label="Filter Profil Partisipan">
			<div className="section-heading"><div><span className="eyebrow">Eksplorasi kelompok</span><h2>Filter Profil Partisipan</h2></div><button className="text-button">Reset</button></div>
			<div className="filter-grid">
				{filters.map((filter, index) => (
					<label key={filter}><span>{filter}</span><select defaultValue={selected && index < 2 ? (index === 0 ? "Jawa Barat" : "Bandung") : "Semua"}><option>Semua</option>{index === 0 && <option>Jawa Barat</option>}{index === 1 && <option>Bandung</option>}</select></label>
				))}
			</div>
			<p className="microcopy">Satu kelompok ditampilkan sekaligus. Kombinasi kecil dapat ditahan sepenuhnya.</p>
		</section>
	);
}

function ActiveCohort({ scene }: { scene: SceneKey }) {
	if (scene !== "filtered" && scene !== "withheld") return <span className="cohort">Semua partisipan</span>;
	return <div className="active-filters"><span>PW Jawa Barat</span><span>PD Bandung</span></div>;
}

function Unavailable() {
	return (
		<div className="unavailable" role="status">
			<div className="unavailable__lock" aria-hidden="true">×</div>
			<span className="eyebrow">Seluruh rincian ditahan</span>
			<h3>Data belum cukup</h3>
			<p>Kelompok ini belum mencapai minimum 20 Respons. Tidak ada total kelompok, distribusi, persentase, atau tren yang ditampilkan.</p>
			<button className="secondary-button">Hapus sebagian filter</button>
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

function StandingPlot({ scene }: { scene: SceneKey }) {
	const [showAll, setShowAll] = useState(false);
	const requestedCandidate = new URLSearchParams(window.location.search).get("candidate");
	const [selectedCandidate, setSelectedCandidate] = useState(() => candidateNames.includes(requestedCandidate || "") ? requestedCandidate : null);

	useEffect(() => {
		if (!selectedCandidate) return;
		const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedCandidate(null); };
		window.addEventListener("keydown", closeOnEscape);
		return () => window.removeEventListener("keydown", closeOnEscape);
	}, [selectedCandidate]);

	if (scene === "withheld") return <Unavailable />;
	return (
		<div className="standing-plot">
			<div className="standing-plot__meta">
				<ActiveCohort scene={scene} />
				<span><b>{totalResponses.toLocaleString("id-ID")}</b> Respons global · tepat</span>
			</div>
			{scene === "filtered" && <p className="controlled-base">Basis terkontrol: sekitar 215 Respons</p>}
			<div className={`ranked-chart ${showAll ? "ranked-chart--all" : ""}`} role="list" aria-label="Distribusi preferensi diurutkan dari terbesar. Nama Lain dan Belum Menentukan selalu berada di akhir.">
				{rankedResults.map((result, index) => (
					<div className={`ranked-chart__row ranked-chart__row--${result.kind}`} key={result.name} role="listitem" style={{ "--bar-width": `${result.value}%`, "--bar-color": candidateColors[index % candidateColors.length] } as CSSProperties}>
						<span className="ranked-chart__rank">{result.kind === "candidate" ? index + 1 : "—"}</span>
						{result.kind === "candidate" ? <button className="candidate-link" aria-haspopup="dialog" onClick={() => setSelectedCandidate(result.name)}>{result.name}</button> : <strong>{result.name}</strong>}
						<div className="ranked-chart__track" aria-hidden="true"><span /></div>
						<span className="ranked-chart__value"><b>{result.percent}</b><small>{result.count.toLocaleString("id-ID")}</small></span>
					</div>
				))}
			</div>
			<button className="show-results" aria-expanded={showAll} onClick={() => setShowAll((value) => !value)}>{showAll ? "Tampilkan ringkas" : "Tampilkan semua 25 kandidat"}</button>
			<p className="microcopy">Angka dibulatkan ke 5 terdekat; persentase dari nilai terkontrol. Komponen dapat tidak berjumlah tepat.</p>
			{selectedCandidate && <CandidateDialog name={selectedCandidate} onClose={() => setSelectedCandidate(null)} />}
		</div>
	);
}

function ThemeTable() {
	return (
		<div className="theme-table-wrap">
			<div className="theme-table-meta"><span>Hanya setelah penutupan</span><span>Ditinjau Project Maintainer · multi-label</span></div>
			<table className="theme-table">
				<thead><tr><th>Kesimpulan</th><th>Jumlah Pendapat Partisipan</th><th>Top Candidate</th><th>Featured Comment</th></tr></thead>
				<tbody>{themeRows.map((row) => <tr key={row.conclusion}><th>{row.conclusion}</th><td>{row.count.toLocaleString("id-ID")}</td><td>{row.candidate}</td><td>{row.comment}<small>Bukan kutipan</small></td></tr>)}</tbody>
			</table>
			<p className="microcopy">Jumlah memakai Respons dengan teks yang dapat dikodekan. Satu Respons dapat masuk lebih dari satu kesimpulan. Top Candidate menunjukkan pilihan terbanyak di antara Respons yang terkait dengan kesimpulan tersebut.</p>
		</div>
	);
}

function PDTable() {
	return (
		<div className="pd-table-wrap">
			<div className="pd-table-meta"><span>{pdRows.length} PD simulasi</span><span>{pdRows.reduce((total, row) => total + row.participants, 0).toLocaleString("id-ID")} partisipan</span></div>
			<table className="pd-table">
				<thead><tr><th>Nama PD</th><th>Jumlah partisipan</th><th>Pilihan teratas</th><th>Persentase</th></tr></thead>
				<tbody>{pdRows.map((row, rowIndex) => (
					<tr key={row.name}>
						<th>
							<span className="pd-tooltip">
								<button aria-describedby={`pd-top-${rowIndex}`}>{row.name}</button>
								<span className="pd-tooltip__card" role="tooltip" id={`pd-top-${rowIndex}`}>
									<b>Top 3</b>
									{row.topThree.map((candidate, rank) => <span key={candidate.name}><i>{rank + 1}</i>{candidate.name}<strong>{candidate.percent}%</strong></span>)}
								</span>
							</span>
						</th>
						<td>{row.participants.toLocaleString("id-ID")}</td><td>{row.topThree[0].name}</td><td><b>{row.topThree[0].percent}%</b></td>
					</tr>
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
			<h2>Ini bukan hasil pemilihan</h2>
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
	name: `PW ${name}`, code, x, y, participants,
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

function RegionMap() {
	const requestedPW = new URLSearchParams(window.location.search).get("pw");
	const [selectedPW, setSelectedPW] = useState(() => pwRegions.find((region) => region.code === requestedPW || region.name === requestedPW) || null);
	const selectedSeed = selectedPW ? pwSeeds.findIndex((seed) => seed[1] === selectedPW.code) : -1;
	const topFive = selectedPW ? topFiveForPW(pwSeeds[selectedSeed][5], selectedSeed) : [];

	useEffect(() => {
		if (!selectedPW) return;
		const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedPW(null); };
		window.addEventListener("keydown", closeOnEscape);
		return () => window.removeEventListener("keydown", closeOnEscape);
	}, [selectedPW]);

	return (
		<div className="region-map">
			<div className="region-map__meta"><span>{pwRegions.length} PW · {totalPWParticipants.toLocaleString("id-ID")} partisipan</span><span>Warna menunjukkan kandidat terkuat</span></div>
			<div className="candidate-legend">{candidateColors.map((color, index) => <span key={color}><i style={{ background: color }} />{candidateNames[index]}</span>)}<span><i className="legend-unavailable" />Data belum cukup</span></div>
			<svg viewBox="0 0 840 260" role="img" aria-label="Peta 32 PW. Warna tiap titik menunjukkan kandidat terkuat pada wilayah dengan sedikitnya 10 partisipan.">
				<path className="map-land" d="M55 39l35 18 30 40 28 46 34 28-17 20-34-21-34-50-33-35-25-30z" />
				<path className="map-land" d="M201 190l88 6 71 18-17 20-100-8-49-19z" />
				<path className="map-land" d="M349 45l91-25 75 35-10 93-67 41-80-39-29-62z" />
				<path className="map-land" d="M532 58l29 25 22-31 17 18-18 48 43 25-20 24-37-17-17 50-21-15 13-55-33-23z" />
				<path className="map-land" d="M646 181l28 4 23 15-17 12-42-9z" />
				<path className="map-land" d="M720 76l94-3 28 61-40 61-78-21-19-59z" />
				<path className="map-islets" d="M375 226h20m17 6h18m16 1h23m15 7h19m122-30h17" />
				{pwRegions.map((region) => (
					<g className={selectedPW?.name === region.name ? "map-point map-point--selected" : "map-point"} key={region.name} role="button" tabIndex={0} aria-haspopup="dialog" aria-label={region.candidate ? `${region.name}: ${region.candidate} terkuat, ${region.participants} partisipan` : `${region.name}: data belum cukup, ${region.participants} partisipan`} onClick={() => setSelectedPW(region)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedPW(region); } }}>
						<title>{region.candidate ? `${region.name} · ${region.candidate} · ${region.participants} partisipan` : `${region.name} · Data belum cukup · ${region.participants} partisipan`}</title>
						<circle cx={region.x} cy={region.y} r="10" style={{ "--region-color": region.color } as CSSProperties} />
						<text x={region.x} y={region.y + 3} textAnchor="middle">{region.code}</text>
					</g>
				))}
			</svg>
			<div className="map-note"><span>Pilih titik PW untuk melihat Top 5 wilayah. Standing global tidak berubah.</span></div>
			<p className="microcopy">Eksperimen: PW dengan cohort di bawah 10 ditampilkan abu-abu. Warna menunjukkan kandidat terkuat, bukan margin kemenangan atau representasi seluruh kader.</p>
			{selectedPW && (
				<div className="pw-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedPW(null); }}>
					<section className="pw-dialog" role="dialog" aria-modal="true" aria-labelledby="pw-dialog-title">
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
					</section>
				</div>
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
		<div className="pw-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
			<section className="pw-dialog candidate-dialog" role="dialog" aria-modal="true" aria-labelledby="candidate-dialog-title">
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
			</section>
		</div>
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
	const initialView = new URLSearchParams(window.location.search).get("view");
	const [view, setView] = useState<"standing" | "pw" | "pd" | "profile" | "themes">(initialView === "pw" || initialView === "pd" || initialView === "profile" || (initialView === "themes" && scene === "final") ? initialView : "standing");
	const [showNotice, setShowNotice] = useState(true);
	const activeView = view === "themes" && scene !== "final" ? "standing" : view;
	return (
		<div className="variant variant-b">
			<header className="b-nav"><Brand /><Status scene={scene} compact /></header>
			<main>
				<section className="b-dashboard-hero">
					<nav className="data-tabs" aria-label="Tampilan dashboard">
						<button className={activeView === "standing" ? "active" : ""} onClick={() => setView("standing")}>Standing</button>
						<button className={activeView === "pw" ? "active" : ""} onClick={() => setView("pw")}>Per PW</button>
						<button className={activeView === "pd" ? "active" : ""} onClick={() => setView("pd")}>Per PD</button>
						<button className={activeView === "profile" ? "active" : ""} onClick={() => setView("profile")}>Profil</button>
						<button className={activeView === "themes" ? "active" : ""} disabled={scene !== "final"} title={scene === "final" ? "Alasan dan Harapan" : "Tersedia setelah Hasil Akhir"} onClick={() => setView("themes")}>Alasan dan Harapan {scene !== "final" && "· setelah final"}</button>
					</nav>
					{activeView === "standing" && <>
						<StandingPlot scene={scene} />
						<details className="b-filter-panel">
							<summary><span><b>Filter Profil Partisipan</b><small>Semua partisipan</small></span><span aria-hidden="true">＋</span></summary>
							<FilterControls scene={scene} compact />
						</details>
						<p className="b-fine-print"><b>Bukan hasil pemilihan.</b> Partisipasi self-selected; status kader tidak diverifikasi; satu nomor WhatsApp bukan bukti satu kader unik. Project Mandala independen, tidak didukung PP KAMMI, dan hasilnya non-binding. <a href="#metode">Metode lengkap</a></p>
					</>}
					{activeView === "pw" && <RegionMap />}
					{activeView === "pd" && <PDTable />}
					{activeView === "profile" && <ProfileCards />}
					{activeView === "themes" && <ThemeTable />}
				</section>
			</main>
			<footer id="metode">Data simulasi · Project Mandala independen, tidak resmi, dan non-binding · <a href="#top">Metode & privasi</a></footer>
			{showNotice && <aside className="b-toast" role="status"><button onClick={() => setShowNotice(false)} aria-label="Tutup catatan batasan">×</button><b>Standing, bukan hasil pemilihan</b><span>Data menggambarkan partisipan survei ini saja. Batasan lengkap tetap tersedia di bawah chart.</span></aside>}
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
			{controls.variant === "A" && <VariantA scene={controls.scene} />}
			{controls.variant === "B" && <VariantB scene={controls.scene} />}
			{controls.variant === "C" && <VariantC scene={controls.scene} />}
			{!import.meta.env.PROD && <PrototypeSwitcher {...controls} />}
		</>
	);
}

export default App;

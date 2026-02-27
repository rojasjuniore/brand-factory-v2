"use client";

import { useState, FormEvent } from "react";

interface BrandData {
  posicionamiento: {
    statement: string;
    propuesta_valor: string[];
  };
  voz_de_marca: {
    tono: string;
    dos: string[];
    donts: string[];
  };
  keywords: string[];
  buyer_personas: Array<{
    nombre: string;
    edad: string;
    ocupacion: string;
    dolores: string[];
    motivaciones: string[];
  }>;
  identidad_visual: {
    paleta_colores: {
      primario: { hex: string; nombre: string; significado: string };
      secundario: { hex: string; nombre: string; significado: string };
      acento: { hex: string; nombre: string; significado: string };
    };
    tipografia: {
      primaria: { font: string; uso: string };
      secundaria: { font: string; uso: string };
    };
    estilo_visual: {
      aesthetic: string;
      elementos_graficos: string[];
    };
  };
  estrategia_digital: {
    plataformas: Array<{ nombre: string; frecuencia: string; enfoque: string }>;
    pilares_contenido: Array<{ nombre: string; porcentaje: number; descripcion: string }>;
    calendario_30_dias: Array<{ dia: number; pilar: string; formato: string; copy: string }>;
    hashtags: { branded: string[]; comunidad: string[] };
  };
}

interface FormData {
  brand_name: string;
  industry: string;
  mission: string;
  target_audience: string;
  values: string;
  tone: string;
  differentiators: string;
  competitors: string;
  visual_style: string;
  logo_style: string;
  color_preference: string;
  website_vision: string;
}

export default function Home() {
  const [step, setStep] = useState<"form" | "loading" | "results">("form");
  const [activeTab, setActiveTab] = useState("strategy");
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [loadingStep, setLoadingStep] = useState(1);
  const [logos, setLogos] = useState<string[]>([]);
  const [generatingLogos, setGeneratingLogos] = useState(false);
  const [formData, setFormData] = useState<FormData | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = Object.fromEntries(form.entries()) as unknown as FormData;
    setFormData(data);

    setStep("loading");
    setLoadingStep(1);

    const progressInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 2500);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("API error");

      const result = await response.json();
      clearInterval(progressInterval);
      setBrandData(result);
      setStep("results");

      // Auto-generate first logo
      generateLogo(data);
    } catch (error) {
      clearInterval(progressInterval);
      alert("Error al generar la marca. Por favor intenta de nuevo.");
      setStep("form");
      console.error(error);
    }
  };

  const generateLogo = async (data: FormData) => {
    setGeneratingLogos(true);
    try {
      const colors = brandData?.identidad_visual?.paleta_colores;
      const colorStr = colors
        ? `${colors.primario?.hex}, ${colors.secundario?.hex}, ${colors.acento?.hex}`
        : data.color_preference;

      const response = await fetch("/api/logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_name: data.brand_name,
          industry: data.industry,
          tone: data.tone,
          visual_style: data.visual_style,
          colors: colorStr,
          logo_style: data.logo_style,
        }),
      });

      const result = await response.json();
      if (result.success && result.image) {
        setLogos((prev) => [...prev, result.image]);
      }
    } catch (error) {
      console.error("Logo generation error:", error);
    } finally {
      setGeneratingLogos(false);
    }
  };

  const generateMoreLogos = () => {
    if (formData) {
      generateLogo(formData);
    }
  };

  return (
    <>
      {/* Header */}
      <header className="py-6 px-4 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl btn-primary flex items-center justify-center font-bold">
              B
            </div>
            <span className="font-semibold text-xl">Brand Factory</span>
          </div>
          <span className="text-gray-500 text-sm hidden md:block">
            Powered by Claude AI + Gemini
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Form Section */}
        {step === "form" && (
          <section>
            <div className="text-center mb-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Crea tu{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                  Marca Completa
                </span>{" "}
                con IA
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Estrategia + Identidad Visual + Plan Digital + Logo. Todo en minutos.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="card-glass rounded-3xl p-8 max-w-3xl mx-auto">
              <div className="grid gap-6">
                {/* Section: Informacion Basica */}
                <div className="border-b border-white/10 pb-4 mb-2">
                  <h2 className="text-lg font-semibold text-indigo-400 mb-1">Informacion Basica</h2>
                  <p className="text-sm text-gray-500">Cuentanos sobre tu marca</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nombre de la marca *
                    </label>
                    <input
                      type="text"
                      name="brand_name"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition"
                      placeholder="Ej: Cafe Origen"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Industria *
                    </label>
                    <input
                      type="text"
                      name="industry"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition"
                      placeholder="Ej: Cafeteria, Moda, Tech"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Mision *</label>
                  <textarea
                    name="mission"
                    required
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition resize-none"
                    placeholder="Por que existe tu marca? Que problema resuelve?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Publico Objetivo *
                  </label>
                  <textarea
                    name="target_audience"
                    required
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition resize-none"
                    placeholder="Describe tu cliente ideal: edad, intereses, comportamientos..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Valores *</label>
                    <input
                      type="text"
                      name="values"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition"
                      placeholder="Ej: Calidad, Innovacion, Sostenibilidad"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Tono *</label>
                    <select
                      name="tone"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none transition cursor-pointer"
                    >
                      <option value="" className="bg-gray-900">Selecciona</option>
                      <option value="profesional y serio" className="bg-gray-900">Profesional</option>
                      <option value="amigable y cercano" className="bg-gray-900">Amigable</option>
                      <option value="lujoso y exclusivo" className="bg-gray-900">Lujoso</option>
                      <option value="innovador y disruptivo" className="bg-gray-900">Innovador</option>
                      <option value="calido y empatico" className="bg-gray-900">Calido</option>
                      <option value="divertido y juvenil" className="bg-gray-900">Divertido</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Que te hace diferente? *
                  </label>
                  <textarea
                    name="differentiators"
                    required
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition resize-none"
                    placeholder="Por que alguien deberia elegirte?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Competencia (opcional)
                  </label>
                  <input
                    type="text"
                    name="competitors"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition"
                    placeholder="Menciona 2-3 competidores principales"
                  />
                </div>

                {/* Section: Identidad Visual */}
                <div className="border-b border-white/10 pb-4 mb-2 mt-4">
                  <h2 className="text-lg font-semibold text-purple-400 mb-1">Identidad Visual</h2>
                  <p className="text-sm text-gray-500">Como imaginas tu marca visualmente</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Estilo Visual
                    </label>
                    <select
                      name="visual_style"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none transition cursor-pointer"
                    >
                      <option value="" className="bg-gray-900">Selecciona</option>
                      <option value="minimalista y limpio" className="bg-gray-900">Minimalista</option>
                      <option value="moderno y tech" className="bg-gray-900">Moderno/Tech</option>
                      <option value="elegante y lujoso" className="bg-gray-900">Elegante/Lujoso</option>
                      <option value="organico y natural" className="bg-gray-900">Organico/Natural</option>
                      <option value="retro y vintage" className="bg-gray-900">Retro/Vintage</option>
                      <option value="bold y expresivo" className="bg-gray-900">Bold/Expresivo</option>
                      <option value="corporativo y profesional" className="bg-gray-900">Corporativo</option>
                      <option value="juvenil y colorido" className="bg-gray-900">Juvenil/Colorido</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tipo de Logo
                    </label>
                    <select
                      name="logo_style"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-indigo-500 outline-none transition cursor-pointer"
                    >
                      <option value="" className="bg-gray-900">Selecciona</option>
                      <option value="wordmark tipografico" className="bg-gray-900">Wordmark (solo texto)</option>
                      <option value="lettermark iniciales" className="bg-gray-900">Lettermark (iniciales)</option>
                      <option value="icono con texto" className="bg-gray-900">Icono + Texto</option>
                      <option value="solo icono simbolico" className="bg-gray-900">Solo Icono</option>
                      <option value="emblema o escudo" className="bg-gray-900">Emblema/Escudo</option>
                      <option value="mascota o personaje" className="bg-gray-900">Mascota</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Preferencia de Colores (opcional)
                  </label>
                  <input
                    type="text"
                    name="color_preference"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition"
                    placeholder="Ej: Azules profesionales, verdes naturales, colores tierra..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Como imaginas tu pagina web? (opcional)
                  </label>
                  <textarea
                    name="website_vision"
                    rows={2}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 outline-none transition resize-none"
                    placeholder="Describe como te gustaria que se vea y sienta tu sitio web..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 btn-primary text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  <span>Crear Mi Marca</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Loading Section */}
        {step === "loading" && (
          <section className="text-center py-20">
            <div className="card-glass rounded-3xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h2 className="text-2xl font-semibold mb-2">
                Creando tu marca<span className="loading-dots"></span>
              </h2>
              <p className="text-gray-400">Analizando tu brief con IA...</p>
              <div className="mt-6 space-y-2 text-sm text-gray-500">
                {[
                  "Generando estrategia de marca",
                  "Creando identidad visual",
                  "Planificando estrategia digital",
                  "Finalizando propuesta",
                ].map((text, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 justify-center ${
                      i + 1 > loadingStep ? "opacity-40" : ""
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        i + 1 < loadingStep
                          ? "bg-green-500"
                          : i + 1 === loadingStep
                          ? "bg-indigo-500 animate-pulse"
                          : "bg-gray-500"
                      }`}
                    ></div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Results Section */}
        {step === "results" && brandData && (
          <section className="section-fade">
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {[
                { id: "strategy", label: "Estrategia" },
                { id: "visual", label: "Identidad Visual" },
                { id: "digital", label: "Plan Digital" },
                { id: "preview", label: "Logo Preview" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition ${
                    activeTab === tab.id ? "tab-active" : ""
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Strategy Tab */}
            {activeTab === "strategy" && (
              <div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="card-glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-indigo-400 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Posicionamiento
                    </h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      {brandData.posicionamiento.statement}
                    </p>
                  </div>

                  <div className="card-glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Propuesta de Valor
                    </h3>
                    <ul className="space-y-2">
                      {brandData.posicionamiento.propuesta_valor.map((prop, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-400 mt-1">+</span>
                          <span className="text-gray-300">{prop}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="card-glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-pink-400 mb-4">Voz de Marca</h3>
                    <p className="text-gray-300 mb-4">{brandData.voz_de_marca.tono}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-green-400 text-sm font-medium mb-2">Si hacer</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          {brandData.voz_de_marca.dos.slice(0, 4).map((d, i) => (
                            <li key={i}>+ {d}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-red-400 text-sm font-medium mb-2">No hacer</h4>
                        <ul className="text-sm text-gray-400 space-y-1">
                          {brandData.voz_de_marca.donts.slice(0, 4).map((d, i) => (
                            <li key={i}>- {d}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="card-glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-cyan-400 mb-4">Keywords de Marca</h3>
                    <div className="flex flex-wrap gap-2">
                      {brandData.keywords.map((k, i) => (
                        <span key={i} className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-4">Buyer Personas</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {brandData.buyer_personas.map((p, i) => (
                      <div key={i} className="card-glass rounded-xl p-4">
                        <h4 className="font-semibold text-indigo-300 mb-2">{p.nombre}</h4>
                        <p className="text-sm text-gray-400 mb-2">{p.edad} - {p.ocupacion}</p>
                        <div className="text-xs text-gray-500">
                          <p className="mb-1">
                            <span className="text-red-400">Dolores:</span> {p.dolores.join(", ")}
                          </p>
                          <p>
                            <span className="text-green-400">Motivaciones:</span> {p.motivaciones.join(", ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Visual Tab */}
            {activeTab === "visual" && (
              <div>
                <div className="card-glass rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-6">Paleta de Colores</h3>
                  <div className="flex flex-wrap gap-6 justify-center">
                    {["primario", "secundario", "acento"].map((colorKey) => {
                      const color = brandData.identidad_visual.paleta_colores[
                        colorKey as keyof typeof brandData.identidad_visual.paleta_colores
                      ];
                      return (
                        <div key={colorKey} className="text-center">
                          <div className="color-swatch mx-auto mb-3" style={{ backgroundColor: color.hex }}></div>
                          <p className="font-medium capitalize">{colorKey}</p>
                          <p className="text-sm text-gray-400">{color.hex}</p>
                          <p className="text-xs text-gray-500 mt-1">{color.significado}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card-glass rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-6">Tipografia</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="text-center">
                      <p className="text-3xl mb-2">{brandData.identidad_visual.tipografia.primaria.font}</p>
                      <p className="text-sm text-gray-400">Titulos - {brandData.identidad_visual.tipografia.primaria.uso}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl mb-2">{brandData.identidad_visual.tipografia.secundaria.font}</p>
                      <p className="text-sm text-gray-400">Cuerpo - {brandData.identidad_visual.tipografia.secundaria.uso}</p>
                    </div>
                  </div>
                </div>

                <div className="card-glass rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Estilo Visual</h3>
                  <p className="text-gray-300 text-lg mb-4">{brandData.identidad_visual.estilo_visual.aesthetic}</p>
                  <div className="flex flex-wrap gap-2">
                    {brandData.identidad_visual.estilo_visual.elementos_graficos.map((e, i) => (
                      <span key={i} className="px-3 py-1 bg-white/10 rounded-full text-sm">{e}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Digital Tab */}
            {activeTab === "digital" && (
              <div>
                <div className="card-glass rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4">Plataformas Recomendadas</h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {brandData.estrategia_digital.plataformas.slice(0, 3).map((p, i) => (
                      <div key={i} className="card-glass rounded-xl p-4 text-center">
                        <p className="text-2xl mb-2">
                          {p.nombre === "Instagram" ? "📸" : p.nombre === "TikTok" ? "🎵" : p.nombre === "LinkedIn" ? "💼" : "📱"}
                        </p>
                        <p className="font-semibold">{p.nombre}</p>
                        <p className="text-sm text-gray-400">{p.frecuencia}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-glass rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4">Pilares de Contenido</h3>
                  <div className="space-y-3">
                    {brandData.estrategia_digital.pilares_contenido.map((p, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-white/5 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">
                          {p.porcentaje}%
                        </div>
                        <div>
                          <p className="font-medium">{p.nombre}</p>
                          <p className="text-sm text-gray-400">{p.descripcion}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card-glass rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-semibold mb-4">Calendario de Contenido (Primera Semana)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-3 px-2 text-gray-400">Dia</th>
                          <th className="text-left py-3 px-2 text-gray-400">Pilar</th>
                          <th className="text-left py-3 px-2 text-gray-400">Formato</th>
                          <th className="text-left py-3 px-2 text-gray-400">Copy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {brandData.estrategia_digital.calendario_30_dias.slice(0, 7).map((c, i) => (
                          <tr key={i} className="border-b border-white/5">
                            <td className="py-3 px-2 text-indigo-300">Dia {c.dia}</td>
                            <td className="py-3 px-2">{c.pilar}</td>
                            <td className="py-3 px-2 text-gray-400">{c.formato}</td>
                            <td className="py-3 px-2 text-gray-300 text-xs">{c.copy}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="card-glass rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Estrategia de Hashtags</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-indigo-400 mb-2">Branded</p>
                      <div className="flex flex-wrap gap-2">
                        {brandData.estrategia_digital.hashtags.branded.map((h, i) => (
                          <span key={i} className="text-sm text-gray-300">{h}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-purple-400 mb-2">Comunidad</p>
                      <div className="flex flex-wrap gap-2">
                        {brandData.estrategia_digital.hashtags.comunidad.map((h, i) => (
                          <span key={i} className="text-sm text-gray-300">{h}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Logo Preview Tab */}
            {activeTab === "preview" && (
              <div className="card-glass rounded-2xl p-8 text-center">
                <h3 className="text-xl font-semibold mb-4">Preview de Logo</h3>
                <p className="text-gray-400 mb-6">
                  Conceptos generados con IA basados en tu estrategia de marca
                </p>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {logos.map((logo, i) => (
                    <div key={i} className="card-glass rounded-xl p-4">
                      <img
                        src={logo}
                        alt={`Logo concept ${i + 1}`}
                        className="w-full h-48 object-contain rounded-lg bg-white"
                      />
                      <a
                        href={logo}
                        download={`logo-${i + 1}.png`}
                        className="mt-3 block text-sm text-indigo-400 hover:text-indigo-300"
                      >
                        Descargar
                      </a>
                    </div>
                  ))}

                  {generatingLogos && (
                    <div className="card-glass rounded-xl p-4 flex items-center justify-center h-56">
                      <div className="text-center">
                        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-sm text-gray-400">Generando logo...</p>
                      </div>
                    </div>
                  )}

                  {logos.length === 0 && !generatingLogos && (
                    <div className="col-span-full text-gray-500 py-8">
                      Click en &quot;Generar Logo&quot; para crear conceptos
                    </div>
                  )}
                </div>

                <button
                  onClick={generateMoreLogos}
                  disabled={generatingLogos}
                  className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition disabled:opacity-50"
                >
                  {generatingLogos ? "Generando..." : "Generar mas variantes"}
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => window.print()}
                className="px-6 py-3 btn-primary rounded-xl transition flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar PDF
              </button>
              <button
                onClick={() => {
                  setStep("form");
                  setBrandData(null);
                  setLogos([]);
                }}
                className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition"
              >
                Crear otra marca
              </button>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

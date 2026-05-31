import { AlertTriangle, Satellite, Brain, Shield, Target, Building2, Droplets, Mountain, Waves, LayoutDashboard, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";

const FONT_MONO = "JetBrains Mono, monospace";
const FONT_DISPLAY = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const casosReais = [
  {
    titulo: "Brumadinho — MG",
    ano: "2019",
    tipo: "Rompimento de Barragem",
    icon: Waves,
    descricao: "O rompimento da barragem da Vale em Brumadinho liberou 12 milhões de m³ de rejeitos, causando 270 mortes. A tragédia evidenciou a falta de monitoramento em tempo real e sistemas de alerta antecipado.",
    impacto: "270 vítimas fatais",
    color: "#ff3d57",
  },
  {
    titulo: "Enchentes no RS",
    ano: "2024",
    tipo: "Enchente Extrema",
    icon: Droplets,
    descricao: "O Rio Grande do Sul enfrentou o maior desastre climático de sua história. Chuvas extremas causaram enchentes que afetaram mais de 2 milhões de pessoas, com 183 mortes e destruição massiva de infraestrutura.",
    impacto: "183 mortes, 2M+ afetados",
    color: "#00d4ff",
  },
  {
    titulo: "Petrópolis — RJ",
    ano: "2022",
    tipo: "Deslizamento de Terra",
    icon: Mountain,
    descricao: "Chuvas de 260mm em 3 horas provocaram deslizamentos devastadores na região serrana. A ocupação irregular em encostas e a ausência de alertas eficazes resultaram em 233 mortes.",
    impacto: "233 vítimas fatais",
    color: "#ff9900",
  },
  {
    titulo: "Litoral Norte — SP",
    ano: "2023",
    tipo: "Deslizamento de Terra",
    icon: Mountain,
    descricao: "São Sebastião registrou 683mm de chuva em 24h — recorde histórico. Deslizamentos massivos destruíram bairros inteiros, causando 65 mortes e deixando milhares desabrigados.",
    impacto: "65 mortes, 683mm em 24h",
    color: "#7c3aed",
  },
];

const odsData = [
  {
    numero: 9,
    titulo: "Indústria, Inovação e Infraestrutura",
    descricao: "O ClimateArgos utiliza tecnologia de ponta — satélites, inteligência artificial e processamento em tempo real — para criar infraestrutura digital de monitoramento que protege comunidades vulneráveis.",
    color: "#ff9900",
    contribuicao: "Inovação tecnológica aplicada à proteção civil com dados satelitais e IA preditiva.",
  },
  {
    numero: 11,
    titulo: "Cidades e Comunidades Sustentáveis",
    descricao: "Ao fornecer alertas antecipados de enchentes, deslizamentos e rompimentos de barragens, o sistema contribui diretamente para tornar cidades mais resilientes e seguras para seus habitantes.",
    color: "#00d4ff",
    contribuicao: "Redução de vulnerabilidade urbana através de monitoramento contínuo e alertas preventivos.",
  },
  {
    numero: 13,
    titulo: "Ação Contra a Mudança Global do Clima",
    descricao: "O sistema monitora eventos climáticos extremos — cada vez mais frequentes devido às mudanças climáticas — e gera dados que auxiliam na adaptação e resposta a esses fenômenos.",
    color: "#00ff88",
    contribuicao: "Adaptação climática com dados em tempo real para resposta rápida a eventos extremos.",
  },
];

export default function SobrePage() {
  return (
    <main className="flex-1 overflow-y-auto relative">
      {/* video de fundo (decorativo) */}
      <video
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
        className="fixed inset-0 w-full h-full object-cover pointer-events-none"
        style={{ zIndex: 0, opacity: 0.15 }}
      >
        <source src="/assets/background_about.mp4" type="video/mp4" />
      </video>

      <div id="conteudo-principal" className="relative z-10 max-w-4xl mx-auto px-6 py-12 space-y-16">

        <motion.section
          className="text-center space-y-4"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex justify-center mb-6">
            <img src="/assets/logo.png" alt="ClimateArgos" className="w-32 h-32 rounded-full object-cover" />
          </div>
          <h1 className="text-4xl text-foreground" style={{ fontFamily: FONT_DISPLAY }}>
            ClimateArgos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" style={{ fontFamily: FONT_DISPLAY }}>
            Sistema de Monitoramento e Previsão de Riscos Climáticos via Satélite com Inteligência Artificial
          </p>

          {/* explicação do nome */}
          <div className="max-w-xl mx-auto bg-card/50 border border-border rounded-lg p-4 mt-4 backdrop-blur-md">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-primary" style={{ fontFamily: FONT_MONO }}>Climate</span> — do inglês, clima.{" "}
              <span className="text-accent" style={{ fontFamily: FONT_MONO }}>Argos</span> — na mitologia grega,
              Argos Panoptes era o gigante de cem olhos, o vigilante que tudo vê. Juntos, representam um sistema de
              <strong className="text-foreground"> vigilância climática absoluta</strong>: olhos no céu que nunca dormem,
              monitorando riscos 24 horas por dia via satélite.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            {["Satélites", "IA Preditiva", "Tempo Real"].map((tag) => (
              <span key={tag} className="px-3 py-1 text-xs rounded border border-primary/30 text-primary bg-primary/10 backdrop-blur-sm shadow-sm shadow-primary/10"
                style={{ fontFamily: FONT_MONO }}>
                {tag}
              </span>
            ))}
          </div>

          {/* CTA */}
          <div className="pt-8">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-3 px-8 py-4 rounded-lg border-2 border-primary/50 bg-primary/10 hover:bg-primary/25 hover:border-primary focus-visible:bg-primary/25 focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:scale-[1.02] transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/50 hover:scale-[1.02] backdrop-blur-md"
            >
              <LayoutDashboard size={22} className="text-primary" />
              <span className="text-lg text-primary" style={{ fontFamily: FONT_DISPLAY, letterSpacing: "0.05em" }}>
                ACESSAR DASHBOARD AO VIVO
              </span>
              <ArrowRight size={18} className="text-primary group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.section>

        <motion.section
          className="space-y-6"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-destructive" />
            <h2 className="text-2xl text-foreground" style={{ fontFamily: FONT_DISPLAY }}>
              O PROBLEMA
            </h2>
          </div>
          <div className="bg-card/50 border border-border rounded-lg p-6 space-y-4 backdrop-blur-md">
            <p className="text-muted-foreground leading-relaxed">
              O Brasil é um dos países mais vulneráveis a desastres climáticos no mundo. Enchentes, deslizamentos de terra
              e rompimentos de barragens causam centenas de mortes e bilhões em prejuízos todos os anos. A combinação de
              ocupação irregular em áreas de risco, infraestrutura precária de monitoramento e mudanças climáticas intensifica
              esses eventos.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Atualmente, muitas comunidades não possuem sistemas de alerta eficazes. Quando os alertas existem, chegam
              tarde demais — minutos antes do desastre, quando a evacuação já não é possível. A falta de integração entre
              dados satelitais, sensores terrestres e modelos preditivos impede uma resposta preventiva eficiente.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: "1.5M+", label: "Pessoas em áreas de risco no Brasil", color: "#ff3d57", hoverClass: "hover:border-destructive/60 hover:shadow-lg hover:shadow-destructive/20" },
                { value: "R$170Bi", label: "Prejuízos com desastres (2013-2023)", color: "#ff9900", hoverClass: "hover:border-[#ff9900]/60 hover:shadow-lg hover:shadow-[#ff9900]/20" },
                { value: "4.000+", label: "Municípios vulneráveis", color: "#7c3aed", hoverClass: "hover:border-accent/60 hover:shadow-lg hover:shadow-accent/20" },
              ].map(({ value, label, color, hoverClass }) => (
                <div key={label} className={`text-center p-3 rounded border border-border bg-secondary/30 hover:scale-105 transition-all duration-300 ${hoverClass}`}>
                  <p className="text-xl" style={{ color, fontFamily: FONT_DISPLAY }}>{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          className="space-y-6"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-accent" />
            <h2 className="text-2xl text-foreground" style={{ fontFamily: FONT_DISPLAY }}>
              CASOS REAIS NO BRASIL
            </h2>
          </div>
          <p className="text-muted-foreground">
            Tragédias recentes que evidenciam a necessidade urgente de sistemas de monitoramento e alerta antecipado:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {casosReais.map((caso) => (
              <div key={caso.titulo} className="bg-card/50 border rounded-lg p-5 space-y-3 transition-all duration-300 hover:scale-[1.02] backdrop-blur-md"
                style={{ borderColor: caso.color + "33" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = caso.color + "88"; e.currentTarget.style.boxShadow = `0 4px 20px ${caso.color}25`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = caso.color + "33"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <caso.icon size={16} style={{ color: caso.color }} />
                    <div>
                      <h3 className="text-foreground text-sm" style={{ fontFamily: FONT_DISPLAY }}>{caso.titulo}</h3>
                      <p className="text-xs text-muted-foreground" style={{ fontFamily: FONT_MONO }}>{caso.tipo}</p>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded" style={{ background: caso.color + "15", color: caso.color, border: `1px solid ${caso.color}33`, fontFamily: FONT_MONO }}>
                    {caso.ano}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{caso.descricao}</p>
                <div className="flex items-center gap-2 pt-1">
                  <AlertTriangle size={10} style={{ color: caso.color }} />
                  <span className="text-xs" style={{ color: caso.color, fontFamily: FONT_MONO }}>{caso.impacto}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="space-y-6"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <Brain size={20} className="text-primary" />
            <h2 className="text-2xl text-foreground" style={{ fontFamily: FONT_DISPLAY }}>
              NOSSA SOLUÇÃO
            </h2>
          </div>
          <div className="bg-card/50 border border-primary/20 rounded-lg p-6 space-y-4 backdrop-blur-md">
            <p className="text-muted-foreground leading-relaxed">
              O <strong className="text-foreground">ClimateArgos</strong> é uma plataforma de monitoramento climático que integra
              dados de satélites (Sentinel-2, GOES-16, MODIS), sensores IoT terrestres e modelos de inteligência artificial
              para prever e alertar sobre riscos de desastres naturais com antecedência.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {[
                { icon: Satellite, title: "Dados Satelitais", desc: "Imagens em tempo real de satélites como Sentinel-2 e GOES-16 para monitoramento contínuo de áreas de risco.", color: "#00d4ff" },
                { icon: Brain, title: "IA Preditiva", desc: "Modelos de machine learning que analisam padrões climáticos e geológicos para prever eventos com horas de antecedência.", color: "#7c3aed" },
                { icon: Target, title: "Alertas Preventivos", desc: "Sistema de alertas em tempo real com classificação de risco (crítico, alto, médio, baixo) para evacuação antecipada.", color: "#ff3d57" },
              ].map(({ icon: Icon, title, desc, color }) => (
                <div key={title} className="p-4 rounded border border-border bg-secondary/20 space-y-2 hover:scale-[1.02] transition-transform duration-200">
                  <Icon size={18} style={{ color }} />
                  <h4 className="text-foreground text-sm" style={{ fontFamily: FONT_DISPLAY }}>{title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          className="space-y-6"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="flex items-center gap-3">
            <Building2 size={20} className="text-accent" />
            <h2 className="text-2xl text-foreground" style={{ fontFamily: FONT_DISPLAY }}>
              ALINHAMENTO COM ODS
            </h2>
          </div>
          <p className="text-muted-foreground">
            O ClimateArgos contribui diretamente para os Objetivos de Desenvolvimento Sustentável da ONU:
          </p>
          <div className="space-y-4">
            {odsData.map((ods) => (
              <div key={ods.numero} className="bg-card/50 border rounded-lg p-5 space-y-3 backdrop-blur-md hover:scale-[1.01] transition-all duration-300"
                style={{ borderColor: ods.color + "33" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = ods.color + "88"; e.currentTarget.style.boxShadow = `0 4px 20px ${ods.color}25`; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = ods.color + "33"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded flex items-center justify-center shrink-0"
                    style={{ background: ods.color + "20", border: `1px solid ${ods.color}44` }}>
                    <span className="text-sm" style={{ color: ods.color, fontFamily: FONT_MONO }}>{ods.numero}</span>
                  </div>
                  <div>
                    <h3 className="text-foreground text-sm" style={{ fontFamily: FONT_DISPLAY }}>ODS {ods.numero}</h3>
                    <p className="text-xs text-muted-foreground">{ods.titulo}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{ods.descricao}</p>
                <div className="flex items-center gap-2 bg-secondary/30 rounded p-2">
                  <Target size={10} style={{ color: ods.color }} />
                  <span className="text-xs" style={{ color: ods.color, fontFamily: FONT_MONO }}>
                    {ods.contribuicao}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.footer
          className="text-center py-8 border-t border-border"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs text-muted-foreground" style={{ fontFamily: FONT_MONO }}>
            ClimateArgos — Global Solution 2026 · FIAPINHOS
          </p>
        </motion.footer>
      </div>
    </main>
  );
}

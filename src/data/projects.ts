export interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  url: string;
  homepage: string | null;
  tags: string[];
  readme?: string;
  screenshots?: string[];
}

const t = (...tags: string[]) => tags;

export const repos: Repo[] = [
  { 
    name: "Puls", 
    description: "Mobile-first prediction market on Arc Testnet. Google sign-in → Circle MPC wallet → trade Polymarket predictions with USDC as gas.", 
    language: "Dart", 
    stars: 1, 
    url: "https://github.com/rdmbtc/Puls", 
    homepage: "https://pulsmarket.tech", 
    tags: t("web3","mobile","fintech","wallet"), 
    readme: "Puls is a mobile-first prediction market built on the Arc Testnet. It abstracts crypto complexity with a Google sign-in flow that provisions a Circle MPC wallet behind the scenes — users trade Polymarket-style predictions using USDC as gas. Built with Flutter for cross-platform delivery, integrated with Circle's programmable wallets, and live at pulsmarket.tech.",
    screenshots: ["/pulsmarket.tech.png", "/pulsmarket.tech mobile.png"]
  },
  { 
    name: "MonDefense", 
    description: "Tower defense game built for Monad Mission 7.", 
    language: "JavaScript", 
    stars: 1, 
    url: "https://github.com/rdmbtc/MonDefense", 
    homepage: "https://mondefense.vercel.app", 
    tags: t("game","web3","monad"), 
    readme: "Tower defense game built for Monad Mission 7. Deploy towers, defend the chain, climb the leaderboard. Vanilla JS canvas rendering with on-chain score submission.",
    screenshots: ["/mondefense.vercel.app_(pc).png"]
  },
  { 
    name: "BobArcPay", 
    description: "AI payment agent on Arc testnet. Link your Twitter handle and send USDC with a tweet reply.", 
    language: "TypeScript", 
    stars: 1, 
    url: "https://github.com/rdmbtc/bobarcpay", 
    homepage: "https://bobarcpay.vercel.app", 
    tags: t("web3","agent","circle-wallets","payments"), 
    readme: "BobArcPay is an automated Twitter payment agent built on the Arc Testnet. Users link their Twitter handles to their Arc wallets, allowing them to send testnet USDC simply by replying to posts with '@bobarcpay send 20 usdc'. The agent processes transfers securely using Circle programmable wallets and responds with transaction receipts and explorer links.",
    screenshots: ["/bobarcpay.vercel.app.png"]
  },
  { 
    name: "Hivemind", 
    description: "Collective intelligence platform.", 
    language: "TypeScript", 
    stars: 0, 
    url: "https://github.com/rdmbtc/Hivemind", 
    homepage: "https://hivemind-theta.vercel.app", 
    tags: t("ai","platform","collab"),
    readme: "Hivemind is a decentralized collective intelligence platform that aggregates community wisdom for decision-making. Built with React and TypeScript, Hivemind integrates AI agents to synthesize discussions and generate consensus reports dynamically on-chain.",
    screenshots: ["/hivemind-protocol.vercel.app_(pc).png"]
  },
  { 
    name: "RitualPulse", 
    description: "Habit and ritual tracker with daily pulse.", 
    language: "TypeScript", 
    stars: 0, 
    url: "https://github.com/rdmbtc/RitualPulse", 
    homepage: "https://ritual-pulse-five.vercel.app", 
    tags: t("productivity","tracker","mobile"),
    readme: "RitualPulse is an elegant daily habit tracker designed to help users build consistent routines. Features interactive calendar heatmaps, customizable reminder pulses, and visual performance tracking logs with local secure state persistence.",
    screenshots: ["/ritualblocks.vercel.app_(pc) (2).png"]
  },
  { 
    name: "RitualScroll", 
    description: "Scroll-driven storytelling experience.", 
    language: "TypeScript", 
    stars: 0, 
    url: "https://github.com/rdmbtc/RitualScroll", 
    homepage: "https://ritual-scroll.vercel.app", 
    tags: t("storytelling","animation","gsap"),
    readme: "RitualScroll is an immersive, scroll-driven storytelling web experience. Showcases advanced typography setups and fluid canvas-rendering scroll scrub loops built using GSAP, ScrollTrigger, and Tailwind CSS.",
    screenshots: ["/ritualscroll.vercel.app_(pc) (1).png"]
  },
  { 
    name: "RitCode", 
    description: "Code editor playground.", 
    language: "TypeScript", 
    stars: 0, 
    url: "https://github.com/rdmbtc/RitCode", 
    homepage: "https://rit-code.vercel.app", 
    tags: t("editor","tool","dx"),
    readme: "RitCode is a high-performance online code editor playground. Enables developers to write, compile, and preview code snippets in real-time with full syntax highlighting, automatic error linting, and sandboxed execution environments.",
    screenshots: ["/rit-code.png"]
  },
  { name: "RitDefense", description: "Tower defense game in JS.", language: "JavaScript", stars: 0, url: "https://github.com/rdmbtc/RitDefense", homepage: "https://rit-defense.vercel.app", tags: t("game") },
  { name: "riteforge", description: "Forging workflows for builders.", language: "TypeScript", stars: 0, url: "https://github.com/rdmbtc/riteforge", homepage: "https://riteforge.vercel.app", tags: t("tool","productivity") },
  { name: "monadfarm", description: "Farming game on Monad.", language: "TypeScript", stars: 0, url: "https://github.com/rdmbtc/monadfarm", homepage: "https://monadfarm.vercel.app", tags: t("game","web3","monad") },
  { name: "nooter's farm", description: "Web3 farm game.", language: "TypeScript", stars: 0, url: "https://github.com/rdmbtc/nooter-s-farm", homepage: "https://nootersfarm.vercel.app", tags: t("game","web3") },
  { name: "PolyNEX", description: "Polymarket-style trading UI.", language: "JavaScript", stars: 0, url: "https://github.com/rdmbtc/PolyNEX", homepage: "https://poly-nex.vercel.app", tags: t("fintech","web3","ui") },
  { name: "proofQuest", description: "Zero-knowledge proof quest app.", language: "JavaScript", stars: 0, url: "https://github.com/rdmbtc/proofQuest", homepage: "https://proof-quest.vercel.app", tags: t("zk","web3","quest") },
  { name: "edgensQuests", description: "Quest platform for Edgen ecosystem.", language: "TypeScript", stars: 0, url: "https://github.com/rdmbtc/edgensQuests", homepage: "https://edgens-quests.vercel.app", tags: t("quest","platform") },
  { name: "edgen-factory", description: "Factory tooling for Edgen.", language: "TypeScript", stars: 0, url: "https://github.com/rdmbtc/edgen-factory", homepage: "https://edgen-factory.vercel.app", tags: t("tool","platform") },
  { name: "edgen-novella", description: "Visual novella in the Edgen world.", language: "JavaScript", stars: 0, url: "https://github.com/rdmbtc/edgen-novella", homepage: "https://edgen-novella.vercel.app", tags: t("game","storytelling") },
  { name: "edgenos-simulator", description: "EdgenOS desktop simulator.", language: "JavaScript", stars: 0, url: "https://github.com/rdmbtc/edgenos-simulator", homepage: "https://edgenos-simulator.vercel.app", tags: t("experiment","ui") },
  { name: "solcasenft", description: "Solana NFT showcase.", language: "CSS", stars: 0, url: "https://github.com/rdmbtc/solcasenft", homepage: "https://solcasenft.vercel.app", tags: t("web3","nft","solana") },
  { name: "MySiggy", description: "Email signature generator.", language: "HTML", stars: 0, url: "https://github.com/rdmbtc/MySiggy", homepage: "https://my-siggy.vercel.app", tags: t("tool","generator") },
  { name: "thumbnail-maker", description: "Quick thumbnail generator.", language: "JavaScript", stars: 0, url: "https://github.com/rdmbtc/thumbnail-maker", homepage: "https://thumbnail-maker-rosy.vercel.app", tags: t("tool","generator") },
  { name: "ultimate-todo-app", description: "Feature-rich todo app.", language: "TypeScript", stars: 0, url: "https://github.com/rdmbtc/ultimate-todo-app", homepage: "https://ultimate-todo-app-five.vercel.app", tags: t("productivity","tracker") },
  { name: "LayerEdge Scam Blocker", description: "Chrome extension that removes LayerEdge scam links on X.com.", language: "JavaScript", stars: 0, url: "https://github.com/rdmbtc/LayerEdge-Scam-Blocker", homepage: null, tags: t("extension","security","tool") },
  { name: "text-to-image-template", description: "Starter template for text-to-image apps.", language: "TypeScript", stars: 0, url: "https://github.com/rdmbtc/text-to-image-template", homepage: null, tags: t("ai","template") },
  { name: "expUP", description: "Python experiment runner.", language: "Python", stars: 0, url: "https://github.com/rdmbtc/expUP", homepage: null, tags: t("tool","experiment") },
  { name: "puls_backend", description: "Backend services powering Puls.", language: "JavaScript", stars: 0, url: "https://github.com/rdmbtc/puls_backend", homepage: null, tags: t("backend","api") },
  { name: "PrivateGPT", description: "Private GPT experiment.", language: null, stars: 0, url: "https://github.com/rdmbtc/PrivateGPT", homepage: null, tags: t("ai","experiment") },
  { name: "LND", description: "Lightning Network experiment.", language: "JavaScript", stars: 0, url: "https://github.com/rdmbtc/LND", homepage: null, tags: t("bitcoin","web3","experiment") },
  { name: "docs", description: "Documentation site.", language: "MDX", stars: 0, url: "https://github.com/rdmbtc/docs", homepage: null, tags: t("docs") },
];

export const featured = repos.slice(0, 6);

export const allTags = Array.from(new Set(repos.flatMap(r => r.tags))).sort();
export const allLanguages = Array.from(new Set(repos.map(r => r.language).filter(Boolean) as string[])).sort();

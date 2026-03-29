// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "About",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-publications",
          title: "Publications",
          description: "Publications in reversed chronological order. Authors are listed alphabetically.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/publications/";
          },
        },{id: "nav-projects",
          title: "Projects",
          description: "The research project I worked on.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-seminars",
          title: "Seminars",
          description: "Seminars, talks and poster presentations.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/seminars/";
          },
        },{id: "nav-simulations",
          title: "Simulations",
          description: "Some personal projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/simulations/";
          },
        },{id: "nav-cv",
          title: "CV",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "projects-atm-excite",
          title: 'ATM-EXCITE',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/atm_excite/";
            },},{id: "projects-eisnet",
          title: 'EISNET',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/eisnet/";
            },},{id: "projects-flocking-matter",
          title: 'Flocking matter',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/flocking_matter/";
            },},{id: "projects-response-in-whole-brain-models",
          title: 'Response in whole-brain models',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/neuroscience/";
            },},{id: "projects-quasi-hydrodynamics",
          title: 'Quasi-hydrodynamics',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/quasihydrodynamics/";
            },},{id: "projects-thin-film-superconductor",
          title: 'Thin film superconductor',
          description: "",
          section: "Projects",handler: () => {
              window.location.href = "/projects/superconductor/";
            },},{id: "simulations-simcom",
          title: 'SIMCOM',
          description: "",
          section: "Simulations",handler: () => {
              window.location.href = "/simulations/SIMCOM/";
            },},{id: "simulations-drone-swarm-dynamics",
          title: 'Drone swarm dynamics',
          description: "",
          section: "Simulations",handler: () => {
              window.location.href = "/simulations/swarm_dynamics/";
            },},{id: "simulations-tennis-match-visualizer",
          title: 'Tennis match visualizer',
          description: "",
          section: "Simulations",handler: () => {
              window.location.href = "/simulations/tennis_point_vis/";
            },},{
        id: 'social-arxiv',
        title: 'arXiv',
        section: 'Socials',
        handler: () => {
          window.open("https://arxiv.org/a/martinoia_l_1.html", "_blank");
        },
      },{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%6C%75%63%61.%6D%61%72%74%69%6E%6F%69%61@%68%6F%74%6D%61%69%6C.%69%74", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/LucaMartinoia", "_blank");
        },
      },{
        id: 'social-inspire',
        title: 'Inspire HEP',
        section: 'Socials',
        handler: () => {
          window.open("https://inspirehep.net/authors/1874454", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/luca-martinoia", "_blank");
        },
      },{
        id: 'social-orcid',
        title: 'ORCID',
        section: 'Socials',
        handler: () => {
          window.open("https://orcid.org/0000-0002-5290-3469", "_blank");
        },
      },{
        id: 'social-researchgate',
        title: 'ResearchGate',
        section: 'Socials',
        handler: () => {
          window.open("https://www.researchgate.net/profile/Luca_Martinoia2/", "_blank");
        },
      },{
        id: 'social-scholar',
        title: 'Google Scholar',
        section: 'Socials',
        handler: () => {
          window.open("https://scholar.google.com/citations?user=JWoVsOMAAAAJ", "_blank");
        },
      },{
        id: 'social-scopus',
        title: 'Scopus',
        section: 'Socials',
        handler: () => {
          window.open("https://www.scopus.com/authid/detail.uri?authorId=57226336422", "_blank");
        },
      },{
        id: 'social-x',
        title: 'X',
        section: 'Socials',
        handler: () => {
          window.open("https://twitter.com/luca_martinoia", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];

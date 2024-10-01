export const navLinks = [
  {
    id: 1,
    label: "new help requests",
    link: "/newHelpRequests",
  },
  {
    id: 2,
    label: "all help requests",
    link: "/allHelpRequests",
  },
  {
    id: 3,
    label: "giveaways",
    link: "/giveaways",
  },
  {
    id: 4,
    label: "givers",
    link: "/givers",
  },
];

export const featureData = [
  {
    id: 1,
    title: "request help",
    body: "A user in need posts a request, specifying the type of help required and any relevant details.",
  },
  {
    id: 2,
    title: "helper response",
    body: " Interested helpers review the request and offer their assistance. The platform may match helpers based on their skills, location, or other criteria.",
  },
  {
    id: 3,
    title: "Escrow and Verification",
    body: "For financial assistance, escrow is used to ensure safe transactions. Helpers and helpees undergo verification to reduce scams.",
  },
  {
    id: 4,
    title: "collaboration and completion",
    body: "The platform facilitates communication and payment between helper and helpee. The helper receives rewards for completing the help, and the helpee provides feedback.",
  },
];

export const currentHelpData = {
  allCategories: ["medical", "accident", "disaster", "agriculture"],
  category: {
    medical: [
      {
        id: 1,
        category: "medical",
        image: "/images/pic1.png",
        title: "How can Chickpox be prevented?",
        numberOfVotes: 2066,
        amount: 12000000,
      },
      {
        id: 2,
        category: "medical",
        image: "/images/pic1.png",
        title: "Ebola outbreak in Liberia, Urgent help",
        numberOfVotes: 276,
        amount: 800000,
      },
      {
        id: 3,
        category: "medical",
        image: "/images/pic1.png",
        title: "Madonna hospital Preventive tools",
        numberOfVotes: 66,
        amount: 1000000,
      },
      {
        id: 1,
        category: "medical",
        image: "/images/pic1.png",
        title: "How can I prevent HIV AIDS in Africa?",
        numberOfVotes: 27,
        amount: 100000,
      },
    ],

    accident: [
      {
        id: 1,
        category: "accident",
        image: "/images/pic2.png",
        title: "Fire gut a 10 story building",
        numberOfVotes: 60,
        amount: 20000000,
      },
      {
        id: 2,
        category: "accident",
        image: "/images/pic2.png",
        title: "What insurance covers fire accident?",
        numberOfVotes: 40,
        amount: 20000000,
      },
      {
        id: 3,
        category: "accident",
        image: "/images/pic2.png",
        title: "How do I prevent fire accident at home, gas cylinder",
        numberOfVotes: 102,
        amount: 20000000,
      },
      {
        id: 1,
        category: "accident",
        image: "/images/pic2.png",
        title: "Loading and trucking accident",
        numberOfVotes: 99,
        amount: 20000000,
      },
    ],
    disaster: [
      {
        id: 1,
        category: "disaster",
        image: "/images/pic2.png",
        title: "How can Chickpox be prevented?",
        numberOfVotes: 60,
        amount: 20000000,
      },
      {
        id: 2,
        category: "disaster",
        image: "/images/pic3.png",
        title: "2 Million inhabitants displaced in Umuoka community",
        numberOfVotes: 40,
        amount: 20000000,
      },
      {
        id: 3,
        category: "disaster",
        image: "/images/pic3.png",
        title: "Flooding in Maiduguru, 60% displaced",
        numberOfVotes: 102,
        amount: 20000000,
      },
      {
        id: 1,
        category: "disaster",
        image: "/images/pic3.png",
        title: "Landslide in Wuhan China",
        numberOfVotes: 99,
        amount: 20000000,
      },
    ],
    agriculture: [
      {
        id: 1,
        category: "agriculture",
        image: "/images/pic4.png",
        title:
          "Government taking over 100 hectars of land in Agwuata community for mining",
        numberOfVotes: 60,
        amount: 20000000,
      },
      {
        id: 2,
        category: "agriculture",
        image: "/images/pic4.png",
        title: "200 Farmers suffering from Climate change",
        numberOfVotes: 40,
        amount: 20000000,
      },
      {
        id: 3,
        category: "agriculture",
        image: "/images/pic4.png",
        title: "What are farm inputs",
        numberOfVotes: 102,
        amount: 20000000,
      },
      {
        id: 1,
        category: "agriculture",
        image: "/images/pic4.png",
        title: "What is tungyan farming",
        numberOfVotes: 99,
        amount: 20000000,
      },
    ],
  },
};

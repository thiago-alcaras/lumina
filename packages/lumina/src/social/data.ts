import type { State, Person, Post, Piece, Mood } from "./types";
export const moods: Mood[] = [
  "Cozy",
  "Romântico",
  "Minimalista",
  "Criativo",
  "Ousado",
];
export const me: Person = {
  id: "demo-me",
  name: "Ana Oliveira",
  handle: "ana.oliveira",
  avatar: "/images/avatar-ana.jpg",
  bio: "Um pouco de café, um pouco de cor. ☕ Ela/dela",
};
export const people: Person[] = [
  {
    id: "clara",
    name: "Clara Martins",
    handle: "clara.m",
    avatar: "/images/avatar-clara.jpg",
    bio: "Vestindo o que me faz feliz. Ela/dela 🌷",
  },
  {
    id: "maya",
    name: "Maya Costa",
    handle: "maya.costa",
    avatar: "/images/avatar-maya.jpg",
    bio: "Moda sem regras. Ela/dela",
  },
  {
    id: "leo",
    name: "Léo Santos",
    handle: "leo.santos",
    avatar: "/images/avatar-leo.jpg",
    bio: "O estilo é livre. Ele/elu",
  },
  {
    id: "julia",
    name: "Júlia Ribeiro",
    handle: "ju.ribeiro",
    avatar: "/images/avatar-julia.jpg",
    bio: "Peças que contam histórias. Ela/dela",
  },
  {
    id: "alex",
    name: "Alex Lima",
    handle: "alex.lima",
    avatar: "/images/avatar-alex.jpg",
    bio: "Criando meu próprio caminho. Elu/delu",
  },
];
const piece = (
  id: string,
  name: string,
  category: string,
  color: string,
  brand: string,
  image: string,
): Piece => ({ id, name, category, color, brand, image, link: "" });
export const initialWardrobe: Piece[] = [
  piece(
    "knit",
    "Suéter de todos os dias",
    "Tricô",
    "Rosa claro",
    "Acervo pessoal",
    "/images/knit.jpg",
  ),
  piece(
    "jeans",
    "Jeans favorito",
    "Calça",
    "Azul",
    "Acervo pessoal",
    "/images/jeans.jpg",
  ),
  piece(
    "dress",
    "Vestido de domingo",
    "Vestido",
    "Vermelho",
    "Acervo pessoal",
    "/images/dress.jpg",
  ),
  piece(
    "bag",
    "Mochila companheira",
    "Acessório",
    "Preto",
    "Acervo pessoal",
    "/images/bag.jpg",
  ),
];
export const demoPosts: Post[] = [
  {
    id: "p1",
    author: people[0],
    title: "Devagar também é um ritmo.",
    description:
      "Tricô favorito, flores pelo caminho e nenhuma pressa. Meu uniforme de domingo.",
    image: "/images/look-cozy.jpg",
    mood: "Cozy",
    pieces: [initialWardrobe[0]],
    likes: 128,
    createdAt: "2026-10-11T12:00:00Z",
  },
  {
    id: "p2",
    author: people[1],
    title: "Uma dose de rosa, por favor.",
    description:
      "Quando o look acompanha o humor. Esse kimono estampado trouxe uma nova vida às minhas peças básicas.",
    image: "/images/look-pink.jpg",
    mood: "Romântico",
    pieces: [
      piece(
        "kimono",
        "Kimono estampado",
        "Casaco",
        "Rosa",
        "Marca não informada",
        "/images/look-pink.jpg",
      ),
    ],
    likes: 96,
    createdAt: "2026-10-11T11:00:00Z",
  },
  {
    id: "p3",
    author: people[2],
    title: "Meu jeito de ocupar a cidade.",
    description:
      "Conforto pra andar sem destino. E um pouco de atitude também.",
    image: "/images/look-street.jpg",
    mood: "Ousado",
    pieces: [
      piece(
        "coat",
        "Casaco azul",
        "Casaco",
        "Azul",
        "Marca não informada",
        "/images/look-street.jpg",
      ),
    ],
    likes: 203,
    createdAt: "2026-10-10T12:00:00Z",
  },
  {
    id: "p4",
    author: people[3],
    title: "Menos peças. Mais eu.",
    description:
      "Neutros, texturas e aquela bolsa que vai comigo para todo lugar.",
    image: "/images/look-minimal.jpg",
    mood: "Minimalista",
    pieces: [
      piece(
        "plaid",
        "Casaco xadrez",
        "Casaco",
        "Azul",
        "Marca não informada",
        "/images/look-minimal.jpg",
      ),
    ],
    likes: 74,
    createdAt: "2026-10-10T10:00:00Z",
  },
  {
    id: "p5",
    author: people[4],
    title: "Cor é meu ponto de partida.",
    description: "Misturar o que já tenho virou meu ritual de criatividade.",
    image: "/images/look-color.jpg",
    mood: "Criativo",
    pieces: [],
    likes: 151,
    createdAt: "2026-10-09T12:00:00Z",
  },
  {
    id: "p6",
    author: people[0],
    title: "Dias de sol, alma leve.",
    description: "Um look para levar a vida lá fora.",
    image: "/images/look-summer.jpg",
    mood: "Romântico",
    pieces: [],
    likes: 87,
    createdAt: "2026-10-08T12:00:00Z",
  },
];
export function seed(): State {
  return {
    posts: demoPosts,
    wardrobe: initialWardrobe,
    stories: people.map((author, i) => ({
      id: "s" + i,
      author,
      image: demoPosts[i].image,
      title: demoPosts[i].title,
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    })),
    likes: [],
    saved: [],
    follows: ["clara", "maya"],
    blocked: [],
    comments: [],
    calendar: [],
    interests: {},
    profile: me,
  };
}

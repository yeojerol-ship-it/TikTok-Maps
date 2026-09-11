import { User } from "@/lib/types";

export const users: User[] = [
  {
    id: "sarah",
    name: "Cody",
    avatar: "/avatars/cody.png",
    placesVisited: 10,
  },
  {
    id: "jamie",
    name: "Jayne",
    avatar: "/avatars/jayne.png",
    placesVisited: 8,
  },
  {
    id: "alex",
    name: "Michelle",
    avatar: "/avatars/michelle.png",
    placesVisited: 12,
  },
  {
    id: "rachel",
    name: "Ruie",
    avatar: "/avatars/ruie.png",
    placesVisited: 5,
  },
  {
    id: "daniel",
    name: "Sherry",
    avatar: "/avatars/sherry.png",
    placesVisited: 4,
  },
  {
    id: "maya",
    name: "Cici",
    avatar: "/avatars/cici.png",
    placesVisited: 7,
  },
  {
    id: "chris",
    name: "Ethel",
    avatar: "/avatars/ethel.png",
    placesVisited: 6,
  },
  {
    id: "lily",
    name: "Jingyi",
    avatar: "/avatars/jingyi.png",
    placesVisited: 3,
  },
  {
    id: "tom",
    name: "Yuri",
    avatar: "/avatars/yuri.png",
    placesVisited: 9,
  },
  {
    id: "you",
    name: "Jerol",
    avatar: "/avatars/jerol.png",
    placesVisited: 6,
  },
];

export const currentUser = users.find((u) => u.id === "you")!;

export const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

import { User } from "@/lib/types";

export const users: User[] = [
  {
    id: "sarah",
    name: "Sarah",
    avatar: "https://i.pravatar.cc/150?img=1",
    placesVisited: 10,
  },
  {
    id: "jamie",
    name: "Jamie",
    avatar: "https://i.pravatar.cc/150?img=3",
    placesVisited: 8,
  },
  {
    id: "alex",
    name: "Alex",
    avatar: "https://i.pravatar.cc/150?img=5",
    placesVisited: 12,
  },
  {
    id: "rachel",
    name: "Rachel",
    avatar: "https://i.pravatar.cc/150?img=9",
    placesVisited: 5,
  },
  {
    id: "daniel",
    name: "Daniel",
    avatar: "https://i.pravatar.cc/150?img=11",
    placesVisited: 4,
  },
  {
    id: "maya",
    name: "Maya",
    avatar: "https://i.pravatar.cc/150?img=16",
    placesVisited: 7,
  },
  {
    id: "chris",
    name: "Chris",
    avatar: "https://i.pravatar.cc/150?img=12",
    placesVisited: 6,
  },
  {
    id: "lily",
    name: "Lily",
    avatar: "https://i.pravatar.cc/150?img=20",
    placesVisited: 3,
  },
  {
    id: "tom",
    name: "Tom",
    avatar: "https://i.pravatar.cc/150?img=15",
    placesVisited: 9,
  },
  {
    id: "you",
    name: "You",
    avatar: "https://i.pravatar.cc/150?img=68",
    placesVisited: 6,
  },
];

export const currentUser = users.find((u) => u.id === "you")!;

export const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

import type { Officer } from "@/types/officers";

const officer = (
  name: string,
  role: string,
  image = "",
): Officer => ({
  name,
  role,
  image,
  "personal website": "",
  linkedin: "",
  github: "",
  orcid: "",
});

// Keep this list in the official Fall 2026 Slack announcement order.
// Add replacement portraits under public/officers/fa26/ and update only the
// matching image field so the roster and its assets stay in one source.
export const officersFa26: Officer[] = [
  officer("Priyam Baruah", "Co-President", "/officers/fa26/priyam-baruah.jpg"),
  officer(
    "Soumyadeep Talukdar",
    "Co-President",
    "/officers/fa26/soumyadeep-talukdar.webp",
  ),
  officer(
    "Vincy Huang",
    "Internal Vice President",
    "/officers/fa26/vincy-huang.jpg",
  ),
  officer(
    "Aahan Sharma",
    "Internal Vice President",
    "/officers/fa26/aahan-sharma.jpg",
  ),
  officer("Kenneth Sarip", "External Vice President"),
  officer(
    "Sreyas Yallapragada",
    "External Vice President",
    "/officers/fa26/sreyas-yallapragada.webp",
  ),
  officer("Tvisha Goel", "Professional Development Chair"),
  officer("Ashley Jaquelyn Leon Martinez", "Professional Development Chair"),
  officer("Bhavna Malladi", "Project Chair", "/officers/fa26/bhavna-malladi.webp"),
  officer(
    "Sanjana Avinash Taware",
    "Project Chair",
    "/officers/fa26/sanjana-taware.jpeg",
  ),
  officer(
    "Mahesh Arunachalam",
    "Contract Chair",
    "/officers/fa26/mahesh-arunachalam.jpeg",
  ),
  officer("Sreshta Yelisetti", "Contract Chair"),
  officer("Rithvik Kotla", "Curriculum Lead", "/officers/fa26/rithvik-kotla.jpg"),
  officer("Agastya Sarmah", "Curriculum Lead"),
  officer(
    "Qile Yang",
    "Web Development and Operations Lead",
    "/officers/fa26/qile-yang.jpg",
  ),
  officer(
    "Hanson Wen",
    "Web Development and Operations Lead",
    "/officers/fa26/hanson-wen.jpg",
  ),
  officer("Vanya Dubey", "Social Chair"),
  officer(
    "John Andrianopoulos",
    "Treasurer",
    "/officers/fa26/john-andrianopoulos.jpg",
  ),
  officer(
    "Indu Rao Devakonda",
    "Publicity Chair",
    "/officers/fa26/indu-rao-devakonda.jpg",
  ),
  officer("Yuna Lee", "Publicity Chair"),
  officer("Ben Tong", "Secretary", "/officers/fa26/ben-tong.jpg"),
  officer("William To", "Historian"),
  officer(
    "Anisha S. Pallikonda",
    "Senior Advisor",
    "/officers/fa26/anisha-pallikonda.webp",
  ),
  officer("Arjun Gurjar", "Senior Advisor", "/officers/fa26/arjun-gurjar.jpeg"),
  officer(
    "Marsiah LeBlanc",
    "Senior Advisor",
    "/officers/fa26/marsiah-leblanc.jpg",
  ),
  officer(
    "Asmar Khasmammadli",
    "Senior Advisor",
    "/officers/fa26/asmar-khasmammadli.webp",
  ),
  officer(
    "Allison Cheng",
    "Senior Advisor",
    "/officers/fa26/allison-cheng.webp",
  ),
];

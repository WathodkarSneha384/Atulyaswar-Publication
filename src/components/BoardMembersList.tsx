import Image from "next/image";
import type { StaticImageData } from "next/image";
import drSanikaImage from "../../Asset/Board_Members/Dr. Sanika Goregaonkar.jpg";
import drVilasImage from "../../Asset/Board_Members/Dr. Vilas Jadhav.png";
import mrAtulKahateImage from "../../Asset/Board_Members/Mr. Atul Kahate.jpeg";
import profSheetalImage from "../../Asset/Board_Members/Prof. Sheetal More.jpg";
import profSuneeraImage from "../../Asset/Board_Members/Prof. Suneera Kasliwal.jpg";
import ptVidyadharImage from "../../Asset/Board_Members/Pt. Vidyadhar Vyas.jpg";

type BoardMember = {
  name: string;
  role: string;
  image: StaticImageData;
  imageClassName?: string;
  details: string[];
};

const boardMembers: BoardMember[] = [
  {
    name: "Pt. Vidyadhar Vyas",
    role: "Editorial Advisor",
    image: ptVidyadharImage,
    details: [
      "Senior Vocalist - Gwalior Gharana",
      "Ex. Vice Chancellor - Bhatkhande Music Institute, Lucknow",
      "Ex. Executive Director - ITC Sangeet Research Academy, Kolkata",
    ],
  },
  {
    name: "Prof. Suneera Kasliwal",
    role: "Editorial Advisor",
    image: profSuneeraImage,
    details: [
      "Senior Artist (Sitar)",
      "Ex. Dean and Ex. Head, Department of Music, University of Delhi",
    ],
  },
  {
    name: "Prof. Sheetal More",
    role: "Member Editorial Board",
    image: profSheetalImage,
    details: [
      "Senior Academician",
      "Head, Department of Music, SNDT Women's University, Pune",
    ],
  },
  {
    name: "Dr. Vilas Jadhav",
    role: "Member Editorial Board",
    image: drVilasImage,
    imageClassName: "board-photo board-photo-contain",
    details: [
      "Deputy Librarian, BMK Knowledge Resource Centre (Pune Branch), SNDT Women's University, Pune",
      "Atulyaswar Publication",
      "Pune",
    ],
  },
  {
    name: "Dr. Sanika Goregaonkar",
    role: "Editor-in-chief, Managing Director",
    image: drSanikaImage,
    details: [
      "Vocalist - Gwalior Gharana",
      "Assistant Professor, SNDT Women's University, Pune",
    ],
  },
  {
    name: "Mr. Atul Kahate",
    role: "Member Editorial Board",
    image: mrAtulKahateImage,
    details: ["Software Professional,", "Writer, Trainer"],
  },
];

export default function BoardMembersList() {
  return (
    <div className="board-list">
      {boardMembers.map((member) => (
        <article className="board-item" key={member.name}>
          <div className="board-photo-wrap">
            <Image
              src={member.image}
              alt={member.name}
              className={member.imageClassName ?? "board-photo"}
            />
          </div>
          <h3>{member.name}</h3>
          <p className="board-role">{member.role}</p>
          <div className="board-details">
            {member.details.map((detail) => (
              <p className="board-detail-line" key={`${member.name}-${detail}`}>
                {detail}
              </p>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

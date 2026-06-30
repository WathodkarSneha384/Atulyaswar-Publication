import Image from "next/image";
import Link from "next/link";
import { boardMembers } from "@/data/boardMembers";

export default function BoardMembersList() {
  return (
    <div className="board-list">
      {boardMembers.map((member) => (
        <article className="board-item" key={member.slug}>
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
              <p className="board-detail-line" key={`${member.slug}-${detail}`}>
                {detail}
              </p>
            ))}
          </div>
          <Link href={`/journal/board-member/${member.slug}`} className="board-profile-link">
            View Profile
          </Link>
        </article>
      ))}
    </div>
  );
}

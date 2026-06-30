import type { StaticImageData } from "next/image";
import drNikhilImage from "../../Asset/Board_Members/Dr. Nikhil Bhagat.jpeg";
import drSanikaImage from "../../Asset/Board_Members/Dr. Sanika Goregaonkar.jpg";
import drVilasImage from "../../Asset/Board_Members/Dr. Vilas Jadhav.png";
import mrAtulKahateImage from "../../Asset/Board_Members/Mr. Atul Kahate.jpeg";
import profSheetalImage from "../../Asset/Board_Members/Prof. Sheetal More.jpg";
import profSuneeraImage from "../../Asset/Board_Members/Prof. Suneera Kasliwal.jpg";
import ptVidyadharImage from "../../Asset/Board_Members/Pt. Vidyadhar Vyas.jpg";

export type BoardMemberSection = {
  title: string;
  paragraphs: string[];
  listItems?: string[];
};

export type BoardMember = {
  slug: string;
  name: string;
  role: string;
  image: StaticImageData;
  imageClassName?: string;
  details: string[];
  intro: string;
  sections: BoardMemberSection[];
  awards?: string[];
};

export const boardMembers: BoardMember[] = [
  {
    slug: "pt-vidyadhar-vyas",
    name: "Pt. Vidyadhar Vyas",
    role: "Editorial Advisor",
    image: ptVidyadharImage,
    details: [
      "Senior Vocalist - Gwalior Gharana",
      "Ex. Vice Chancellor - Bhatkhande Music Institute, Lucknow",
      "Ex. Executive Director - ITC Sangeet Research Academy, Kolkata",
    ],
    intro:
      "Pandit Vidyadhar Vyas is a rare three-in-one phenomenon in Hindustani Music, combining performance, academics, and administration.",
    sections: [
      {
        title: "Artistic Journey",
        paragraphs: [
          "He is a \"Top grade\" artist of AIR and Doordarshan, and an empanelled \"Outstanding\" artist of ICCR. A renowned exponent of the Gwalior Gharana, he adheres to the Paluskar style, having learned from his father, Pandit Narayanrao Vyas, a disciple of Vishnu Digambar Paluskar. His training emphasized classical forms like Khayal, Tarana, and Bhajan Gayaki.",
          "He has given innumerable concert performances all over India and internationally—including the U.S., Europe, and Mauritius—across major festivals.",
        ],
      },
      {
        title: "Academic & Administrative Leadership",
        paragraphs: [
          "He has headed institutions such as the Mumbai University Music Department; Bhatkhande Music Institute University, Lucknow as Vice Chancellor; and ITC Sangeet Research Academy, Kolkata as Executive Director. He has been teaching, training, and mentoring students towards performance and research.",
          "He is M.A. (Sociology) and Sangeetacharya (Doctorate), recipient of ICSSR Senior Fellowship for Post-Doctoral Socio-Musicological research. He has contributed to the landmark book \"Raga Guide\" meant for learners abroad.",
        ],
      },
    ],
    awards: [
      "Sangeet Natak Akademi Award (2007) for outstanding contributions to Hindustani vocal music.",
      "Tansen Samman (2019) by the Tansen Samaroh in Gwalior.",
      "ICSSR Senior Fellowship for post-doctoral research in socio-musicology.",
      "Dr. Mallikarjun Mansur National Award (2023) from the Dr. Mallikarjun Mansur Memorial National Trust, Dharwad.",
      "Nominated for the Padma Bhushan in 2023.",
    ],
  },
  {
    slug: "suneera-kasliwal",
    name: "Prof. Suneera Kasliwal",
    role: "Editorial Advisor",
    image: profSuneeraImage,
    details: [
      "Senior Artist (Sitar)",
      "Ex. Senior Professor, Department of Music, Faculty of Music & Fine Arts, University of Delhi",
    ],
    intro:
      "Ex. Senior Professor in the Department of Music, Faculty of Music & Fine Arts, University of Delhi, Dr. Suneera Kasliwal has combined her performance career with academics and research in music.",
    sections: [
      {
        title: "Training & Performance",
        paragraphs: [
          "She had her early training in Music under the guidance of Dr. Sharda Mishra at Jaipur. Later, she became a disciple of Late Pt. Lal Mani Mishra, a famous Vichitra Veena player and a renowned musicologist at Banaras Hindu University. From the late eighties, she learnt from renowned artist of Delhi, Pt. Uma Shankar Mishra (Maihar Gharana), the senior most disciple of Pt. Ravi Shankar.",
          "Her notable international and national performances include the Festival of India - Moscow, USSR; An Exhibition of musical instruments of India at Tashkent - Uzbekistan; Swar Sadhana Samiti – Mumbai; Ustad Allauddin Khan Sangeet Akademi – Bhopal; Rajasthan Sangeet Natak Akademi - Jodhpur; Uttar–Dakshin Festival, organized jointly by ICCR and NCZCC - New Delhi; NCPA - Mumbai, 1997; Swami Haridas Sangeet Sammelan - Mumbai; World Habitat Centre - New Delhi; Tansen Samaroh – Gwalior; ITC Sangeet Research Academy - Kolkata.",
        ],
      },
      {
        title: "Writing & Editorial Work",
        paragraphs: [
          "Along with the work as writer and interviewer, she has reviewed many programmes and music books for Sangeet Natak Akademi (Delhi) Journal (Quarterly), 'Sangeet' magazine (monthly), Jansatta (daily newspaper) & 'Samkaleen Sahitya' (a monthly journal of Sahitya Academi, New Delhi), 'Kala Prayojan' (A quarterly magazine of WZCC). She was on the Editorial Board of her departmental journal 'Vageeshwari' many times.",
        ],
      },
      {
        title: "Consultancy & Expert Committees",
        paragraphs: [],
        listItems: [
          "Sangeet Natak Akademi (SNA), New Delhi – Detailed documentation of Recordings of SNA archives, Brihaddeshi, Vadya Darshan",
          "NCERT, New Delhi – Expert Committee Member",
          "Indira Gandhi National Open University, New Delhi - Expert Committee Member",
          "Expert in Scholarships & Selection Committee in Dept. of Culture Talent Search, CCRT, Delhi, Rajasthan Sangeet Natak Akademi, Jodhpur, Banasthali Vidyapeeth, Rajasthan, Mumbai University, Mumbai, Delhi Public School, Mathura Road, Delhi, and more",
        ],
      },
      {
        title: "Publications",
        paragraphs: [],
        listItems: [
          "\"Classical Musical Instruments\" published by Rupa & Co., New Delhi, 2001 — currently running a 4th Edition as an e-book.",
          "\"Sur Tar\" published in Hindi by Kanishka Publishers, Delhi, 2002 — currently running 2nd edition.",
          "\"Ravanhattha: Epic Journey of an Instrument in Rajasthan\" published by Shubhi Publications, Gurgaon, in July 2009.",
        ],
      },
    ],
  },
  {
    slug: "dr-nikhil-bhagat",
    name: "Dr. Nikhil Bhagat",
    role: "Member Editorial Board",
    image: drNikhilImage,
    imageClassName: "board-photo board-photo-contain",
    details: [
      "Associate Professor in Tabla",
      "Department of Instrumental Music, Faculty of Performing Arts",
      "Banaras Hindu University, Varanasi, Uttar Pradesh",
    ],
    intro:
      "An Associate Professor of Tabla in the Department of Instrumental Music, Faculty of Performing Arts, Banaras Hindu University (BHU), Varanasi.",
    sections: [
      {
        title: "Academic Profile",
        paragraphs: [
          "He holds a Ph.D. in Tabla, is a UGC-NET/JRF awardee, and has extensive experience in teaching, research, performance, and academic administration. Dr. Bhagat has published numerous research papers and articles in reputed national and international journals and has presented scholarly work at conferences in India and abroad.",
          "His academic interests include Tabla pedagogy, rhythm studies, performance practice, musicology, and technology-assisted music education. He is the developer of the SWAYAM course \"Introduction to Tehai Concept in Tabla Playing\", contributing significantly to online music education in India.",
          "He is also credited with obtaining the first patent by a Tabla faculty member in India, reflecting his commitment to innovation in the field of percussion studies.",
        ],
      },
      {
        title: "Performance & Global Outreach",
        paragraphs: [
          "An accomplished performer, Dr. Bhagat has presented Tabla solo and accompaniment concerts across India and internationally. He has conducted concerts, workshops, and lecture-demonstrations in Mauritius, Sri Lanka, Thailand, and other cultural and academic institutions, promoting Indian rhythmic traditions globally.",
          "Dr. Bhagat is a B-High Grade Artist of All India Radio, an approved Ph.D. guide, examiner, and subject expert for several universities. He has accompanied renowned musicians and continues to mentor students and researchers while contributing actively to the advancement of Indian classical music through teaching, research, performance, and innovation.",
        ],
      },
    ],
  },
  {
    slug: "sheetal-more",
    name: "Prof. Sheetal More",
    role: "Member Editorial Board",
    image: profSheetalImage,
    details: [
      "Senior Professor and Head, Department of Music",
      "SNDT Women's University, Pune",
    ],
    intro:
      "Sr. Prof. Sheetal More is a highly distinguished educator and vocalist of Hindustani Classical Music, currently serving as Senior Professor and Head of the Department of Music at S.N.D.T. Women's University in Pune.",
    sections: [
      {
        title: "Leadership & Administration",
        paragraphs: [
          "Having an experience of 29 years, her leadership extends significantly beyond the classroom setting. Prof. More holds critical administrative roles including Member of Academic Council of SNDT Women's University, Mumbai; Chairperson of Board of Studies - Music of SNDT Women's University, Mumbai; Member of Management Council, SNDT Women's University Mumbai.",
          "She has been a Member of board of studies of Dr Babasaheb Ambedkar University, Aurangabad, College of Music Goa, Rashtrasant Tukadoji Maharaj Nagpur University, Mumbai University, Raja Mansingh Tomar Music & Arts University Gwalior, Shivaji University, Kolhapur, and Academic Council nominee on the Board of Studies in Music New Arts, Commerce and Science College, Ahmednagar (Autonomous).",
        ],
      },
      {
        title: "Research Contributions",
        paragraphs: [
          "Prof. More successfully guided 13 scholars to the completion of their Ph.D. degrees, with six more currently pursuing their research under her mentorship. She has led major and minor research projects funded by the UGC, including a major project focusing on the contribution of female artists in enriching the cultural development of Maharashtra. She has published 10 research papers in various national and international journals.",
        ],
      },
      {
        title: "Books Authored",
        paragraphs: [],
        listItems: [
          "Co-author of the book \"Expressions on the Violin in Hindustani Classical Music\"",
          "Book Chapter titled 'Pracheen Sankalpanao Par Samakalin Sanshodhan Ki Upayuktata' in the book titled 'Bharatiya Lalit Kalaoki Dnyanpranali (Parampara Tatha Navachar)' edited by Dr. Anaya Thatte",
        ],
      },
    ],
    awards: [
      "The Annapurna Devi Foundation's 'Shikshkottam Samman' for excellence as a music teacher.",
      "The \"Maharshi Karve Utkrusta Shikshak Puraskar\" awarded by S.N.D.T. Women's University.",
      "Maharshi Pandit Vishnu Digambar Paluskar Sangeet Ratna Purskar",
    ],
  },
  {
    slug: "vilas-jadhav",
    name: "Dr. Vilas Jadhav",
    role: "Member Editorial Board",
    image: drVilasImage,
    imageClassName: "board-photo board-photo-contain",
    details: [
      "Deputy Librarian, Knowledge Resource Centre",
      "SNDT Women's University, Pune branch",
    ],
    intro:
      "Dr. Vilas Jadhav is presently working as a Deputy Librarian at Knowledge Resource Centre, SNDT Women's University, Pune branch and coordinating Shodhganga, eShodhsindhu, Vidwan and IRINS database and DrillBit Plagiarism detection software for faculty and research students for SNDT WU.",
    sections: [
      {
        title: "Qualifications & Experience",
        paragraphs: [
          "He has completed his Ph.D. in Library and Information Science, NET in LIS, M. Com. and B. Ed. from Savitribai Phule Pune University, Pune. Having 20 years of experience in the field of Library and Information Science and working experience in different library setups such as College, Research and University Libraries.",
          "Dr. Jadhav worked as a Documentation Officer at Gokhale Institute of Politics & Economics, Pune during 2008 to 2015 and headed Census Data Centre established by Directorate of Census Operations, Government of Maharashtra.",
        ],
      },
      {
        title: "Research & Guidance",
        paragraphs: [
          "He is research Guide in the SNDT Women's University, Mumbai and four students are currently doing research under his guidance. Dr. Jadhav has published more than 30 research articles in national and International Journals. His area of interests are Library automation, Databases, E-Resources, Consortia, Open Access, Library technology etc.",
        ],
      },
    ],
  },
  {
    slug: "sanika-goregaonkar",
    name: "Dr. Sanika Goregaonkar",
    role: "Editor-in-chief, Managing Director",
    image: drSanikaImage,
    details: [
      "Vocalist - Gwalior Gharana",
      "Assistant Professor, SNDT Women's University, Pune",
    ],
    intro:
      "Dr. Sanika Goregaonkar is a multifaceted professional who seamlessly bridges the worlds of traditional Indian classical music, academia, and technology.",
    sections: [
      {
        title: "Musical Training & Performance",
        paragraphs: [
          "An 'A Grade' Vocalist for All India Radio in both classical and semi-classical genres, she brings over 25 years of rich performing experience to her diverse career as an artist, educator, music producer, and software developer. She received comprehensive training from Pt. Vidyadhar Vyas, a senior maestro of the Gwalior Gharana's prominent Paluskar Tradition.",
          "She expanded her stylistic depth under Dr. Vikas Kashalkar, gaining training across three prominent gharanas: Gwalior, Jaipur, and Agra. Her expertise in semiclassical forms like Thumri, Dadra, Kajri, and Hori was honed under Dr. Sanjeev Shende.",
          "Few of her notable individual performances include Taurya Pratishthan (North Carolina, USA), Sangeet Natak Akademi (New Delhi), and the Promising Artist's Series at the NCPA (Mumbai), Bandra Music Circle, ITC-SRA Western Region, Mumbai, Sur Mansur Festival, Mumbai, Indore Akashvani Sammelan, All India Radio – Indore, Ekamra Mahotsav (Bhubaneshwar), Dadar Matunga Cultural Center, Mumbai, Gunras Piya Sangeet Samaroh (Raipur) and many more.",
        ],
      },
      {
        title: "Academic & Digital Work",
        paragraphs: [
          "Dr. Goregaonkar holds her Ph.D. in Music from S.N.D.T. Women's University, Pune, and was awarded the UGC-NET with both Junior and Senior Research Fellowships. She holds an M.Sc. in Computer Science as well as Masters of Arts in Music.",
          "As a music producer, arranger, and singer, her digital productions (including the Saptashati Stotra and Mahalakshmi Ashtak) have more than 18 million views on YouTube. Her team programmed and developed a fully featured Tanpura and Tabla mobile application.",
          "She currently serves as an Assistant Professor for Post Graduate Music at S.N.D.T. Women's University, Pune, since 2021. She also serves as an Expert Mentor for Classical & Semi-Classical Music at the Atulyaswar Academy of Music.",
        ],
      },
      {
        title: "Publications",
        paragraphs: [],
        listItems: [
          "Book chapter: \"Vidushi Shobha Gurtu: Ek Asamanya Vaggeyakar\" in Stylistic & Aesthetic Approach in Thumri published by Department of Music, SNDT Women's University.",
          "Book chapter: \"Gwalior Gayakicha Aatmabodh\" in Shodh Swanubhav edited by Prof. Sheetal More.",
          "Eight Research Papers published in various national and international peer-reviewed music journals, along with many articles in Sangeet Kala Vihar magazine.",
        ],
      },
    ],
    awards: [
      "'Uttung Sangeet Naipunya Award' given by Uttung Parivar, Mumbai",
      "D. V. Paluskar award and other 10 awards from Padmavibhushan Dr. Prabhatai Atre for standing first in Sangeet Visharad and securing highest marks in India, at Gandharva Mahavidyalaya, Vashi",
      "Pt. Balkrishnabuwa Ichalkaranjikar Puraskar given by Shreemant Appasaheb Satbhai Pratishthan",
      "Late Nitin Ranade Smruti Puraskar given by Chinchvad Devasthan and Naadbrahma Parivar",
    ],
  },
  {
    slug: "atul-kahate",
    name: "Mr. Atul Kahate",
    role: "Member Editorial Board",
    image: mrAtulKahateImage,
    details: ["Software Professional,", "Writer, Trainer"],
    intro:
      "Software Professional, Trainer, passionate about learning and teaching the latest technologies in Computer Science. Worked in the IT industry, mainly in technical/hands-on roles for over 25 years, with training experience of about 25 years as visiting faculty.",
    sections: [
      {
        title: "Professional Experience",
        paragraphs: [],
        listItems: [
          "TRAINER | C-DAC, PUNE, EDUREKA - Trained thousands of IT professionals and students on Agentic AI and a variety of subjects ranging from AI/ML to DevOps and Cloud. Also conducted corporate trainings.",
          "SOFTWARE PROFESSIONAL | SYNTEL, AMERICAN EXPRESS, DEUTSCHE BANK, LTI, ORACLE, RIA ADVISORY - Worked on many complex software projects and products in roles ranging from Developer to Head-Technology. Worked in India, England, Germany, USA, Singapore.",
          "VISITING FACULTY | SYMBIOSIS INTERNATIONAL UNIVERSITY, PUNE - Taught many technical subjects for students of Master of Computer Application and Master of Business Administration.",
        ],
      },
      {
        title: "Authorship",
        paragraphs: [
          "Authored ~80 books and over ~3000 articles. Authored many books on computer science (published by McGraw-Hill and Pearson) on subjects such as Cryptography and Network Security, Web Technologies, OOAD, Operating Systems, DBMS, C++, etc.",
          "He has various bestselling Marathi books to his credit on various topics such as history, economics, medicine, international politics, science, technology, biography, and cricket. Many of these won several awards. Regular contributor to leading Marathi newspapers. His books are referred in the syllabus of around 50 national and international universities. Some of these books are also translated to Chinese language.",
        ],
      },
    ],
    awards: [
      "Utkrushta Vangmay Puraskar given by State Government of Maharashtra",
      "Marathi Sahitya Parishad Puraskar (2 times)",
      "Indradhanu Puraskar given by Maharashtra Times",
      "Computer Society of India Award for IT education and literacy",
      "Indira Excellence Award",
      "Samajik Krutadnyata Puraskar given by G R Foundation",
    ],
  },
];

export function getBoardMemberBySlug(slug: string) {
  return boardMembers.find((member) => member.slug === slug) ?? null;
}

export function getAllBoardMemberSlugs() {
  return boardMembers.map((member) => member.slug);
}

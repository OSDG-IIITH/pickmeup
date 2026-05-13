import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { ulid } from 'ulid';
import * as schema from './schema';
import { users, ideas, tags, votes, comments, commentvotes } from './schema';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

// users
const U = {
	aditya:  { id: ulid(), handle: 'aditya.sharma',    name: 'Aditya Sharma',    role: 'moderator' as const },
	priya:   { id: ulid(), handle: 'priya.krishnan',   name: 'Priya Krishnan',   role: 'moderator' as const },
	rahul:   { id: ulid(), handle: 'rahul.mehta',      name: 'Rahul Mehta',      role: 'user' as const },
	sneha:   { id: ulid(), handle: 'sneha.verma',      name: 'Sneha Verma',      role: 'user' as const },
	arjun:   { id: ulid(), handle: 'arjun.reddy',      name: 'Arjun Reddy',      role: 'user' as const },
	kavya:   { id: ulid(), handle: 'kavya.patel',      name: 'Kavya Patel',      role: 'user' as const },
	nikhil:  { id: ulid(), handle: 'nikhil.singh',     name: 'Nikhil Singh',     role: 'user' as const },
	divya:   { id: ulid(), handle: 'divya.bhat',       name: 'Divya Bhat',       role: 'user' as const },
	rohan:   { id: ulid(), handle: 'rohan.gupta',      name: 'Rohan Gupta',      role: 'user' as const },
	ananya:  { id: ulid(), handle: 'ananya.chakraborty', name: 'Ananya Chakraborty', role: 'user' as const },
	varun:   { id: ulid(), handle: 'varun.menon',      name: 'Varun Menon',      role: 'user' as const },
	ishaan:  { id: ulid(), handle: 'ishaan.trivedi',   name: 'Ishaan Trivedi',   role: 'user' as const },
};

const all = Object.values(U);

const ideadata = [
	{
		id: ulid(), pinned: true, status: 'open' as const, authorid: U.aditya.id,
		title: 'Forms Portal for IIIT',
		body: `Right now, if you need to submit a leave request, apply for a bonafide certificate, or request a NOC, you either email someone and hope for a reply, or walk to the admin block and wait. There is no single place to find or submit official forms.\n\nThe idea is a simple web portal where all campus forms live in one place. You fill them in online, submit, and can track the status without having to follow up manually.\n\nWhat this would cover:\n- Leave applications\n- Bonafide and verification letters\n- Fee receipts and NOC requests\n- Lab and room booking requests\n- Any other recurring paperwork\n\nThe backend can start simple. A form submission goes to the right person's inbox with a reference number. The student gets a confirmation and can check if it has been processed. No more "did you receive my email?" follow-ups.`,
		tags: ['infra', 'utility'],
	},
	{
		id: ulid(), pinned: true, status: 'open' as const, authorid: U.priya.id,
		title: 'Course Review Platform',
		body: `Before registering for electives, students mostly ask seniors in their hostel or their friend group. If you do not know the right people, you are guessing. And once you are in a bad course, there is no way out until the semester ends.\n\nA course review platform would let students leave reviews after finishing a course. Reviews would cover things like workload, how useful the content actually was, quality of instruction, grading fairness, and whether the course matched its description.\n\nThis kind of thing exists at most universities abroad. We have nothing.\n\nSome specifics worth deciding:\n- Should reviews be anonymous? Probably yes, at least by default.\n- Should the instructor see reviews? Maybe after the semester grade submission deadline.\n- Can reviews be left for advisors and labs too, not just courses?\n\nEven a basic read-only archive of past reviews would be more useful than what we have now.`,
		tags: ['academics', 'community'],
	},
	{
		id: ulid(), pinned: false, status: 'open' as const, authorid: U.rahul.id,
		title: 'Open Source Contribution Leaderboard',
		body: `A lot of students here contribute to open source but there is no visibility into it. Someone could be a maintainer of a moderately popular library and nobody on campus would know.\n\nPropose a leaderboard that tracks GitHub contributions from IIIT-H students. Students link their GitHub accounts, and the system pulls public contribution data. You can see who has the most merged PRs, which projects people are working on, and what languages or ecosystems are popular here.\n\nThis is not about competition for its own sake. It does a few useful things:\n- Makes open source work visible to peers and recruiters visiting campus\n- Helps students find others working on similar things\n- Gives the SRC or clubs something concrete to showcase\n\nNot a blocker but would be great if it also showed contributions to OSDG repos.`,
		tags: ['community'],
	},
	{
		id: ulid(), pinned: false, status: 'open' as const, authorid: U.sneha.id,
		title: 'Water Quality Monitor for Campus Water Coolers',
		body: `Nobody knows if the water from campus coolers is actually safe. The filters get replaced on some schedule that is not publicly visible, and there have been complaints about the taste in Bakul and Parijat for a while now.\n\nPropose installing simple water quality monitors at all campus water coolers that display basic readings: TDS, pH, and whether the filter is due for replacement. Data can also be logged and made available on a dashboard.\n\nThis is not a huge infrastructure project. Basic TDS and pH sensors are cheap. The harder part is getting someone responsible for acting on the readings.\n\nAt minimum, even just publishing the filter replacement schedule publicly would be a start.`,
		tags: ['infra', 'safety', 'iot'],
	},
	{
		id: ulid(), pinned: false, status: 'open' as const, authorid: U.arjun.id,
		title: 'Better IT Documentation',
		body: `The IT support documentation on the intranet is either missing, outdated, or written for someone who already knows what they are doing. Every semester there are freshers asking the same questions on hostel WhatsApp groups because there is nowhere official to look.\n\nSome things that need clear, maintained documentation:\n- How to connect to the campus VPN\n- How to access the institute mail from a client like Thunderbird\n- How to use the printing system in the library\n- What to do if your internet account gets suspended\n- How to access AIMS and what each section is for\n\nPropose that the IT team, or even a group of student volunteers, write and maintain a wiki covering the most common questions. Something like a docs site that actually gets updated when things change.\n\nWould also be useful to have one IT support email that actually responds, instead of students guessing which department to contact.`,
		tags: ['infra'],
	},
	{
		id: ulid(), pinned: false, status: 'open' as const, authorid: U.kavya.id,
		title: 'iiit hinge',
		body: `This might get some laughs but hear it out. Campus social life is small and everyone already knows everyone, which makes it awkward to express interest in someone without it immediately becoming public. Hinge and Tinder exist but matching with someone on Tinder and then running into them at the mess is a different kind of weird.\n\nA campus-specific app with institute email login would mean everyone on it is actually a student here. You match, you talk, no mutual friend drama unless you choose to involve them.\n\nIt does not need to be romantic only. Could be friends, study partners, whatever.\n\nObvious concerns:\n- Privacy: needs to be handled very carefully\n- Consent and safety features need to be built in from day one, not bolted on later\n- Should not be possible to identify who is on the app unless they match with you\n\nIs there appetite for this? Would help to know before investing in building it.`,
		tags: ['community', 'social'],
	},
	{
		id: ulid(), pinned: false, status: 'open' as const, authorid: U.nikhil.id,
		title: 'A social network for iiit',
		body: `Facebook is dead for our age group. Instagram is fine but not built for campus-specific community. WhatsApp groups are chaotic and you have to be added manually. LinkedIn is too formal.\n\nThere is no good way to share what you are working on, find people with overlapping interests, or see what is happening on campus in a structured way.\n\nA campus social network built around IIIT-H would let students:\n- Post updates, projects, or questions to the campus community\n- Follow people and topics they care about\n- Discover events, club activities, and research talks in one feed\n- Have a verified student identity without it being tied to their real name if they prefer\n\nThis is a bigger build than the other ideas here. But it is also the kind of thing that, if done well, could replace five different WhatsApp groups and actually make campus life feel more connected.\n\nWorth a proper scoping discussion before committing.`,
		tags: ['community', 'social'],
	},
];

async function seed() {
	console.log('clearing data...');
	await db.delete(commentvotes);
	await db.delete(comments);
	await db.delete(votes);
	await db.delete(tags);
	await db.delete(ideas);
	await db.delete(users);

	console.log('seeding users...');
	await db.insert(users).values(all).onConflictDoNothing();

	console.log('seeding ideas...');
	await db.insert(ideas).values(
		ideadata.map(({ tags: _, ...rest }) => rest)
	).onConflictDoNothing();

	console.log('seeding tags...');
	const tagrows = ideadata.flatMap((idea) =>
		idea.tags.map((tag) => ({ idea: idea.id, tag }))
	);
	await db.insert(tags).values(tagrows).onConflictDoNothing();

	console.log('seeding idea votes...');
	const voters = all.map((u) => u.id);
	const votepairs: { idea: string; user: string }[] = [];
	for (const idea of ideadata) {
		const n = idea.pinned ? voters.length : Math.floor(Math.random() * voters.length);
		const shuffled = [...voters].sort(() => Math.random() - 0.5).slice(0, n);
		for (const uid of shuffled) {
			if (uid !== idea.authorid || Math.random() > 0.3) {
				votepairs.push({ idea: idea.id, user: uid });
			}
		}
	}
	const voteuniq = [...new Map(votepairs.map((v) => [`${v.idea}:${v.user}`, v])).values()];
	await db.insert(votes).values(voteuniq).onConflictDoNothing();

	console.log('seeding comments...');
	const commentrows: (typeof comments.$inferInsert)[] = [];

	// forms portal
	const idea0 = ideadata[0];
	const c0a = ulid(), c0b = ulid(), c0c = ulid(), c0d = ulid(), c0e = ulid(), c0f = ulid();
	commentrows.push(
		{ id: c0a, idea: idea0.id, authorid: U.rahul.id, parent: null, body: 'The bonafide certificate process alone took me three trips to the admin block last semester. An online form with a tracking number would fix this completely.' },
		{ id: c0b, idea: idea0.id, authorid: U.sneha.id, parent: null, body: 'Also please include hostel-related forms. Requesting repairs or reporting issues currently means texting the warden directly and hoping they remember.' },
		{ id: c0c, idea: idea0.id, authorid: U.aditya.id, parent: c0b, body: 'Hostel forms are a good addition. We could scope it to all student-facing administrative requests, not just academic ones.' },
		{ id: c0d, idea: idea0.id, authorid: U.arjun.id, parent: null, body: 'What does the backend look like? If each form just emails the right department, that is already a massive improvement with minimal build effort.' },
		{ id: c0e, idea: idea0.id, authorid: U.aditya.id, parent: c0d, body: 'Yes, that is exactly the plan for v1. Email routing with a reference number. No fancy workflow engine, just structured submission and a paper trail.' },
		{ id: c0f, idea: idea0.id, authorid: U.kavya.id, parent: null, body: 'Would this work for things like course withdrawal requests? Those currently involve physical signatures from three different people.' },
	);

	// course review
	const idea1 = ideadata[1];
	const c1a = ulid(), c1b = ulid(), c1c = ulid(), c1d = ulid(), c1e = ulid(), c1f = ulid();
	commentrows.push(
		{ id: c1a, idea: idea1.id, authorid: U.nikhil.id, parent: null, body: 'I picked two electives last semester based entirely on vibes because I did not know anyone who had taken them. One was great, one was a waste. Reviews would have fixed this.' },
		{ id: c1b, idea: idea1.id, authorid: U.divya.id, parent: null, body: 'Anonymous reviews are important. If your name is attached, you will either say nothing useful or not submit at all.' },
		{ id: c1c, idea: idea1.id, authorid: U.rohan.id, parent: c1b, body: 'Agreed. But there should also be some way to flag reviews that are clearly not genuine, without needing to de-anonymize them.' },
		{ id: c1d, idea: idea1.id, authorid: U.priya.id, parent: null, body: 'The part about advisor and lab reviews is something a lot of research students would benefit from. That information basically does not exist anywhere right now.' },
		{ id: c1e, idea: idea1.id, authorid: U.ananya.id, parent: c1d, body: 'Lab reviews would need more careful handling than course reviews. The advisor-advisee dynamic makes it harder to be honest even with anonymity.' },
		{ id: c1f, idea: idea1.id, authorid: U.ishaan.id, parent: null, body: 'Even just a rating for "did the course match its description" would be useful. Some courses here are completely different from what the syllabus says.' },
	);

	// open source leaderboard
	const idea2 = ideadata[2];
	const c2a = ulid(), c2b = ulid(), c2c = ulid(), c2d = ulid(), c2e = ulid();
	commentrows.push(
		{ id: c2a, idea: idea2.id, authorid: U.kavya.id, parent: null, body: 'I would want this to show project-level context, not just raw commit counts. A thousand commits to a personal config repo should not rank above ten merged PRs to a real project.' },
		{ id: c2b, idea: idea2.id, authorid: U.rahul.id, parent: c2a, body: 'Agreed. Merged PRs to repos with more than a certain number of stars might be a reasonable filter. Open to other ideas though.' },
		{ id: c2c, idea: idea2.id, authorid: U.varun.id, parent: null, body: 'This would be great for OSDG to promote. We could highlight contributions to our own repos and use it as a recruitment tool for the club.' },
		{ id: c2d, idea: idea2.id, authorid: U.arjun.id, parent: null, body: 'Recruiters from some companies specifically ask for GitHub profiles now. Making it easy to surface strong ones from our campus is a good move.' },
		{ id: c2e, idea: idea2.id, authorid: U.sneha.id, parent: null, body: 'Opt-in only please. Not everyone wants their GitHub linked to their campus identity.' },
	);

	// water quality
	const idea3 = ideadata[3];
	const c3a = ulid(), c3b = ulid(), c3c = ulid(), c3d = ulid(), c3e = ulid();
	commentrows.push(
		{ id: c3a, idea: idea3.id, authorid: U.rohan.id, parent: null, body: 'The cooler near the Bakul common room has smelled faintly of something for months. I stopped using it. Having actual data would tell us whether that is a real problem or just the pipes.' },
		{ id: c3b, idea: idea3.id, authorid: U.divya.id, parent: null, body: 'TDS sensors are genuinely cheap. You can get one for a few hundred rupees. The cost argument does not hold up here.' },
		{ id: c3c, idea: idea3.id, authorid: U.ishaan.id, parent: c3b, body: 'The cost is not the sensors, it is getting someone to take responsibility for acting when the readings are bad. That is the real ask here.' },
		{ id: c3d, idea: idea3.id, authorid: U.sneha.id, parent: null, body: 'At minimum just publish the filter replacement log somewhere. Let us see when each cooler was last serviced.' },
		{ id: c3e, idea: idea3.id, authorid: U.ananya.id, parent: c3d, body: 'That is a good starting point that requires almost no infrastructure. Just admin transparency.' },
	);

	// IT docs
	const idea4 = ideadata[4];
	const c4a = ulid(), c4b = ulid(), c4c = ulid(), c4d = ulid(), c4e = ulid(), c4f = ulid();
	commentrows.push(
		{ id: c4a, idea: idea4.id, authorid: U.nikhil.id, parent: null, body: 'The VPN setup alone took me two days as a fresher because the official guide was for a different version of the client. Someone had posted a fix on Reddit of all places.' },
		{ id: c4b, idea: idea4.id, authorid: U.kavya.id, parent: null, body: 'The printing system in the library has no documentation at all. Every time someone new tries to use it they have to ask the person next to them.' },
		{ id: c4c, idea: idea4.id, authorid: U.varun.id, parent: null, body: 'If IT does not have the bandwidth to write this, student volunteers can do it. OSDG or any tech club could own a docs repo. IT just needs to verify accuracy.' },
		{ id: c4d, idea: idea4.id, authorid: U.arjun.id, parent: c4c, body: 'This is the right approach. IT provides access and reviews, students write the actual content. Faster and probably better written.' },
		{ id: c4e, idea: idea4.id, authorid: U.rohan.id, parent: null, body: 'The AIMS portal also needs a walkthrough. Took me a full semester to figure out where to find my attendance records.' },
		{ id: c4f, idea: idea4.id, authorid: U.divya.id, parent: null, body: 'A single IT helpdesk email that is actually monitored would solve half the problems. Right now nobody knows who to contact for what.' },
	);

	// dating app
	const idea5 = ideadata[5];
	const c5a = ulid(), c5b = ulid(), c5c = ulid(), c5d = ulid(), c5e = ulid(), c5f = ulid();
	commentrows.push(
		{ id: c5a, idea: idea5.id, authorid: U.rahul.id, parent: null, body: 'The social graph on campus is so small that regular apps feel weird to use. This actually makes a lot of sense here.' },
		{ id: c5b, idea: idea5.id, authorid: U.ananya.id, parent: null, body: 'Privacy has to be airtight. If someone can figure out who is on the app without matching, it will not be used by most people who would actually benefit from it.' },
		{ id: c5c, idea: idea5.id, authorid: U.ishaan.id, parent: c5b, body: 'Basic requirement: institute email to sign up, but the profile should not surface your actual name unless you choose to add it.' },
		{ id: c5d, idea: idea5.id, authorid: U.sneha.id, parent: null, body: 'The friend/study partner use case is underrated. Not everyone is looking to date but a lot of people struggle to find others with similar interests in a structured way.' },
		{ id: c5e, idea: idea5.id, authorid: U.varun.id, parent: c5d, body: 'Yes, if it is framed as a general social matching app with an optional "open to dating" toggle, it probably gets more adoption and less stigma.' },
		{ id: c5f, idea: idea5.id, authorid: U.kavya.id, parent: null, body: 'Would need a clear reporting and blocking system from day one. Not negotiable.' },
	);

	// social network
	const idea6 = ideadata[6];
	const c6a = ulid(), c6b = ulid(), c6c = ulid(), c6d = ulid(), c6e = ulid(), c6f = ulid();
	commentrows.push(
		{ id: c6a, idea: idea6.id, authorid: U.divya.id, parent: null, body: 'The event discovery problem alone justifies this. I found out about a talk I wanted to attend two days after it happened because the only announcement was in a WhatsApp group I was not in.' },
		{ id: c6b, idea: idea6.id, authorid: U.arjun.id, parent: null, body: 'The hard part is getting adoption. If even 30% of the campus does not use it, the people who stay on WhatsApp will miss things and complain the app is useless.' },
		{ id: c6c, idea: idea6.id, authorid: U.nikhil.id, parent: c6b, body: 'You need at least clubs and the SRC to post officially on it from day one. If official announcements go there, people will follow.' },
		{ id: c6d, idea: idea6.id, authorid: U.rohan.id, parent: null, body: 'The project showcase angle is the most interesting to me. I want to see what people are building here. Right now you only hear about things through word of mouth.' },
		{ id: c6e, idea: idea6.id, authorid: U.priya.id, parent: null, body: 'This is a large build. Worth scoping down to one core feature first and expanding from there, rather than trying to build everything at once.' },
		{ id: c6f, idea: idea6.id, authorid: U.ishaan.id, parent: c6e, body: 'Agree. Start with event announcements and a campus feed. Get people in the habit of checking it. Add the social features once there is a user base.' },
	);

	await db.insert(comments).values(commentrows).onConflictDoNothing();

	console.log('seeding comment votes...');
	const cvpairs: { comment: string; user: string }[] = [];
	for (const c of commentrows) {
		const n = Math.floor(Math.random() * 6);
		const shuffled = [...voters].sort(() => Math.random() - 0.5).slice(0, n);
		for (const uid of shuffled) {
			cvpairs.push({ comment: c.id, user: uid });
		}
	}
	const cvuniq = [...new Map(cvpairs.map((v) => [`${v.comment}:${v.user}`, v])).values()];
	await db.insert(commentvotes).values(cvuniq).onConflictDoNothing();

	console.log('done.');
	await client.end();
}

seed().catch((e) => { console.error(e); process.exit(1); });
import { getDB } from "../database/database.js";

const	verify2fa = async (req, reply) => {
	const	formData = await req.formData();
	const	code = formData.get('code');
	const	db = getDB();

	const formData = req.formData();
	const userId = formData.get('user_id');
	const code = formData.get('code');

	console.log("user: ", userId, "code: ", code);
};

export default { verify2fa };

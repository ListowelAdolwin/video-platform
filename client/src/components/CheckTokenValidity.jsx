import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loginUser, logoutUser } from "../redux/features/user/userSlice";

const CheckTokenValidity = () => {
	const dispatch = useDispatch();
	const { currentUser } = useSelector(state => state.user);
	const API_URL = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const checkToken = async () => {
			if (currentUser) {
				const res = await fetch(`${API_URL}/api/auth/token-validity`, {
					headers: {
						Authorization: `Bearer ${currentUser.accessToken}`,
					},
				});
				const data = await res.json();
				if (!data.ok) {
					const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
						headers: {
							Authorization: `Bearer ${currentUser.refreshToken}`,
						},
					});
					const refreshData = await refreshRes.json();
					if (refreshData.ok) {
						const updatedUser = {
							...currentUser,
							accessToken: refreshData.accessToken,
							refreshToken: refreshData.refreshToken,
						};
						dispatch(loginUser(updatedUser));
					} else {
						dispatch(logoutUser());
					}
				}
			}
		};

		checkToken();
	}, []);

	return null;
};

export default CheckTokenValidity;

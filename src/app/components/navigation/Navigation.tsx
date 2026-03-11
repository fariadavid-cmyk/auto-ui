"use client";

import { useState } from "react";
import NavigationAppBar from "@/app/components/navigation/NavigationAppBar";
import NavigationSideBar from "@/app/components/navigation/NavigationSideBar";

const Navigation = () => {
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const toggleSidebar = () => {
		setIsSidebarOpen(!isSidebarOpen);
	};

	return (
		<>
			<NavigationSideBar isOpen={isSidebarOpen} toggle={toggleSidebar} />
			<NavigationAppBar toggleSidebar={toggleSidebar} />
		</>
	);
};

export default Navigation;
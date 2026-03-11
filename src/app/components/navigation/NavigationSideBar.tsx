import * as React from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import HomeIcon from '@mui/icons-material/Home';
import AddStatementIcon from '@mui/icons-material/PlaylistAdd';
import EditNoteIcon from '@mui/icons-material/EditNote';
import FormatAlighJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import ReceiptIcon from '@mui/icons-material/Receipt';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import SettingsIcon from '@mui/icons-material/Settings';
import Link from "next/link";

interface SidebarLink {
	label: string,
	url: string,
	icon: typeof HomeIcon
};

const sidebarLinks : SidebarLink[] = [
	{ label: "Home", url: "/", icon: HomeIcon },
	{ label: "Add Statements", url: "/import", icon: AddStatementIcon },
	{ label: "Uncategorized", url: "/uncategorized", icon: EditNoteIcon },
	{ label: "Transactions", url: "/transactions", icon: FormatAlighJustifyIcon },
	{ label: "Budgets", url: "/budget", icon: RequestQuoteIcon },
	{ label: "Expense Book", url: "/expenses", icon: PriceChangeIcon },
	{ label: "Advanced", url: "/advanced", icon: SettingsIcon }

];

export default function NavigationSideBar({ isOpen, toggle }: { isOpen: boolean; toggle: () => void }) {
	const toggleDrawer = () => () => {
    	toggle();
    };

	const DrawerList = (
		<Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer()}>
			<List>
				{sidebarLinks.map((link, index) => (
					<Link key={index} href={link.url}>
						<ListItem key={link.label} disablePadding>
							<ListItemButton>
								<ListItemIcon>
									<link.icon/>
								</ListItemIcon>
								<ListItemText primary={link.label} />
							</ListItemButton>
						</ListItem>
					</Link>
				))}
			</List>
			<Divider />
		</Box>
	);

	return (
		<div>
			<Drawer open={isOpen} onClose={toggleDrawer()}>
				{DrawerList}
			</Drawer>
		</div>
	);
}
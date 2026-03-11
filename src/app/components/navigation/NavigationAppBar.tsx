import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';

import Link from "next/link";

interface AppbarLink {
	label: string,
	url: string
};

const appbarLinks : AppbarLink[] = [
	{ label: "Home", url: "/" },
	{ label: "Add Statements", url: "/import" },
	{ label: "Uncategorized", url: "/uncategorized" },
	{ label: "Transactions", url: "/transactions" },
	{ label: "Budgets", url: "/budget" },
	{ label: "Expense Book", url: "/expenses" },
	{ label: "Advanced", url: "/advanced" }
];

export default function NavigationAppBar({ toggleSidebar }: { toggleSidebar: () => void }) {
	const toggleSideBarDrawer = () => () => {
    	toggleSidebar();
    };

	return (
		<Box sx={{ flexGrow: 1 }}>
			<AppBar position="static">
				<Toolbar>
					<IconButton
						size="large"
						edge="start"
						color="inherit"
						aria-label="menu"
						sx={{ mr: 2 }}
						onClick={toggleSideBarDrawer()}
					>
						<MenuIcon />
					</IconButton>
					<Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            			{appbarLinks.map((item) => (
              				<Button key={item.label} sx={{ color: '#fff' }}>
                				<Link href={item.url}>{item.label}</Link>
              				</Button>
            			))}
          			</Box>
				</Toolbar>
			</AppBar>
		</Box>
	);
}
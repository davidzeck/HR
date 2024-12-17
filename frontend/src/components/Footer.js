const Footer = () => {
    const currentYear = new Date().getFullYear();
    
    return (
        <footer className="bg-white border-t py-4 mt-auto">
            <div className="container mx-auto px-4">
                <div className="text-center text-gray-600 text-sm">
                    <p>&copy; {currentYear} Ezekiel David Olubandwa. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 
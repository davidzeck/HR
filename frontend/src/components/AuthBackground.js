function AuthBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2301&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-900/60" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/30" />
    </div>
  );
}

export default AuthBackground; 
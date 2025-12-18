await sessions.restore();

if (sessions.activeUser) {
    console.log("Welcome back!", sessions.activeUser.npub);
}

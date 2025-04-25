static async refreshToken(token: string) {
  try {
    console.log('Refreshing token:', token); // Debugging log

    const decoded: any = jwt.verify(token, tokenSecret);
    const user = await this.getUserByEmail(decoded.email);

    if (!user || user.refreshToken !== token) {
      console.error('Invalid refresh token'); // Debugging log
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    const payload = {
      id: user.userId,
      email: user.email,
    };

    console.log('Refresh token valid. Generating new access token...'); // Debugging log

    return {
      name: user.email,
      access: jwt.sign(payload, tokenSecret, { expiresIn: accessTTL }),
      refresh: token,
    };
  } catch (error) {
    console.error('Failed to refresh token:', error.message); // Debugging log
    throw new Error('REFRESH_FAILED');
  }
}

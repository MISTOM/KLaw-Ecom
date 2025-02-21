<script lang="ts">
	const { username, link, origin } = $props();
</script>

<div style="font-family: Arial, sans-serif; color: #333333; background-color: #f7f7f7; padding: 20px;">
	<table
		align="center"
		width="600"
		style="border-collapse: collapse; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd;"
	>
		<tbody>
			<!-- Logo -->
			<tr>
				<td style="padding: 20px; text-align: center;">
					<img src="{origin}/kLawLogo.png" alt="Kenya Law Logo" style="max-width: 150px; margin-bottom: 20px;" />
				</td>
			</tr>

			<!-- Header & Body -->
			<tr>
				<td style="padding: 0 20px 20px 20px;">
					<h1 style="font-size: 24px; color: #8f2a2b; text-align: center; margin-bottom: 20px;">
						Verify Your Email
					</h1>
					<p style="font-size: 16px; line-height: 1.5; margin-bottom: 8px;">
						Hello {username},<br />
						Thank you for registering with Kenya Law. Please confirm your email address by clicking the button below.
						The link will expire in 1 hr.
					</p>
					<p style="text-align: center;">
						<a
							href={link}
							target="_blank"
							style="
								display: inline-flex;
								align-items: center;
								justify-content: center;
								background-color: #8f2a2b;
								color: #ffffff;
								padding: 8px 26px;
								text-decoration: none;
								border-radius: 3px;
								border: 1px solid #8f2a2b;
								font-weight: 500;
							"
						>
							Verify Email
						</a>
					</p>

					<p style="font-size: 14px; line-height: 1.5; margin-top: 8px">
						If you did not sign up for an account or believe this is an error, kindly ignore this email.
					</p>
					<p style="font-size: 14px; line-height: 1.5;">
						Regards,<br />
						Kenya Law Team
					</p>
				</td>
			</tr>

			<!-- Footer -->
			<tr>
				<td style="padding: 20px; text-align: center; background-color: #f0f0f0;">
					<p style="font-size: 12px; color: #999999; margin-bottom: 5px;">
						© 2025 National Council for Law Reporting (Kenya Law)
					</p>
					<p style="font-size: 12px; color: #999999;">
						<a
							href="https://kenyalaw.org/kl/index.php?id=2161"
							style="color: #999999; text-decoration: underline;"
						>
							Creative Commons
						</a>
						&nbsp;|&nbsp;
						<a href="https://kenyalaw.org/kl/index.php?id=390" style="color: #999999; text-decoration: underline;">
							Privacy Policy and Disclaimer
						</a>
					</p>
				</td>
			</tr>
		</tbody>
	</table>
</div>

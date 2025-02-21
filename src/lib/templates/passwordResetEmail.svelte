<script lang="ts">
	const { link, origin } = $props();
</script>

<!-- Password Reset Email Template -->

<div style="font-family: Arial, sans-serif; color: #333333; background-color: #f7f7f7; padding: 20px;">
	<table
		align="center"
		width="600"
		style="border-collapse: collapse; margin: 0 auto; background-color: #ffffff; border: 1px solid #dddddd;"
	>
		<tbody>
			<tr>
				<td style="padding: 20px; text-align: center;">
					<img src="{origin}/kLawLogo.png" alt="Kenya Law Logo" style="max-width: 150px; margin-bottom: 20px;" />
				</td>
			</tr>
			<tr>
				<td style="padding: 0 20px 20px 20px;">
					<h1 style="font-size: 24px; color: #8f2a2b; text-align: center; margin-bottom: 20px;">
						Reset Your Password
					</h1>
					<p style="font-size: 16px; line-height: 1.5; margin-bottom: 5px;">
						Hello,<br />
						We received a request to reset your password. Click the button below to proceed.
					</p>
					<p style="text-align: center;">
						<a
							href={link}
							target="_blank"
							style="display: inline-flex;
								align-items: center;
								justify-content: center;
								background-color: #8f2a2b;
								color: #ffffff;
								padding: 8px 16px;
								text-decoration: none;
								border-radius: 3px;
								border: 1px solid #8f2a2b;
								font-weight: 500;"
						>
							Reset Password
						</a>
					</p>
					<p style="font-size: 14px; line-height: 1.5; margin-top: 8px;">
						If you did not request a password reset, please ignore this email or contact us immediately.
					</p>
					<p style="font-size: 14px; line-height: 1.5;">
						Best regards,<br />
						Kenya Law Team
					</p>
				</td>
			</tr>
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

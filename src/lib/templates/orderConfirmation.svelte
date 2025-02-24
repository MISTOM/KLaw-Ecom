<script lang="ts">
	import type { Order, ProductOnOrder } from '@prisma/client';

	const { username, order, origin } = $props<{
		username: string;
		order: Order & { ProductOnOrder: (ProductOnOrder & { product: { name: string; price: number } })[] };
		origin: string;
	}>();
</script>

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
						Order Confirmation
					</h1>
					<p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
						Hello {username},<br />
						Thank you for your order. We're pleased to confirm that we've received your payment and your order has been
						processed successfully.
					</p>

					<div style="margin: 20px 0; padding: 15px; background-color: #f8f8f8; border-radius: 4px;">
						<p style="margin: 0; font-weight: bold;">Order Details:</p>
						<p style="margin: 5px 0;">Order Reference: {order.billRefNumber}</p>
						<p style="margin: 5px 0;">Invoice Number: {order.invoiceNumber}</p>
						<p style="margin: 5px 0;">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
					</div>

					<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
						<thead>
							<tr style="background-color: #f0f0f0;">
								<th style="padding: 10px; text-align: left;">Item</th>
								<th style="padding: 10px; text-align: center;">Quantity</th>
								<th style="padding: 10px; text-align: right;">Price</th>
								<th style="padding: 10px; text-align: right;">Total</th>
							</tr>
						</thead>
						<tbody>
							{#each order.ProductOnOrder as item}
								<tr style="border-bottom: 1px solid #eeeeee;">
									<td style="padding: 10px;">{item.product.name}</td>
									<td style="padding: 10px; text-align: center;">{item.quantity}</td>
									<td style="padding: 10px; text-align: right;">KES {item.product.price}</td>
									<td style="padding: 10px; text-align: right;">
										KES {item.quantity * item.product.price}
									</td>
								</tr>
							{/each}
							<tr>
								<td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total:</td>
								<td style="padding: 10px; text-align: right; font-weight: bold;">
									KES {order.totalPrice}
								</td>
							</tr>
						</tbody>
					</table>

					<p style="font-size: 14px; line-height: 1.5;">
						The products will be available in your account's purchases section. You can download them at any time.
					</p>

					<p style="font-size: 14px; line-height: 1.5;">
						If you have any questions about your order, please contact our support team.
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

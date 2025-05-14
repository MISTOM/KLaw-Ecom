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
						Order Confirmation – Kenya Law Publications
					</h1>
					<p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
						Dear {username},<br />
						Thank you for your order with Kenya Law Online Bookstore.<br />
						We are pleased to confirm that we have received your order for the following publications:
					</p>

					<div style="margin: 20px 0; padding: 15px; background-color: #f8f8f8; border-radius: 4px;">
						<p style="margin: 0; font-weight: bold;">Order Summary:</p>
						<p style="margin: 5px 0;">Order Number: {order.billRefNumber}</p>
						<p style="margin: 5px 0;">Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
						<p style="margin: 5px 0;">Invoice Number: {order.invoiceNumber}</p>
					</div>

					<p style="margin: 0; font-weight: bold;">Publications:</p>
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
								<td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Total Amount:</td>
								<td style="padding: 10px; text-align: right; font-weight: bold;">
									KES {order.totalPrice}
								</td>
							</tr>
						</tbody>
					</table>

					<p style="font-size: 14px; line-height: 1.5;">
						Your order is currently being processed. The products will be available in your account's purchases
						section.
					</p>

					<p style="font-size: 14px; line-height: 1.5;">
						If you have any questions or need further assistance, feel free to contact us at
						<a href="mailto:info@kenyalaw.org">info@kenyalaw.org</a> or call us at +254 20 271 2767, 20 271 9231.
					</p>

					<p style="font-size: 14px; line-height: 1.5;">Thank you for choosing Kenya Law.</p>

					<p style="font-size: 14px; line-height: 1.5;">
						Best Regards,<br />
						Kenya Law Sales, Marketing & Customer Care Team<br />
						<a href="https://www.kenyalaw.org">www.kenyalaw.org</a>
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

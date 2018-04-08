import { DateParser } from '../../validators/date-parser.validator';
import { Category } from "../categories/category.models";
import { IsISO8601 } from 'class-validator';

export class Post {

	id: number;
	title: string;
	text: string;
	createDate: Date = new Date();

	@IsISO8601()
	@DateParser()
	publishDate: Date;

	categories: Category[];

	constructor(
			id: number,
			title: string,
			text: string,
			categories: Category[]) {
		this.id = id;
		this.title = title;
		this.text = text;
		this.categories = categories;
	}

}
import { Body, Delete, Get, JsonController, Param, Post } from "routing-controllers";
import { Service } from "typedi";
import { CategoriesService } from "./categories.service";
import { Category } from './category.models';

@Service()
@JsonController()
export class CategoriesController {

	constructor(private categoryService: CategoriesService) {
	}

	@Get("/categories")
	all(): Promise<Category[]> {
		return this.categoryService.findAll();
	}

	@Get("/categories/:id")
	one(@Param("id") id: number): Category {
		return this.categoryService.findOne(id);
	}

	@Post("/categories")
	category(@Body() category: Category): Category {
		return this.categoryService.save(category);
	}

	@Delete("/categories/:id")
	delete(@Param("id") id: number): Category {
		return this.categoryService.remove(id);
	}
}

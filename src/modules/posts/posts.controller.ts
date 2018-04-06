import { Body, Delete, Get, JsonController, Param, Post as HttpPost } from "routing-controllers";
import { Service } from "typedi";
import { Acl } from '../../acl.decorator';
import { Post } from "./post.models";
import { PostsService } from "./posts.service";

@Service()
@JsonController()
export class PostsController {

    constructor(private postService: PostsService) {
    }

		@Acl([{ action: 'createPost' }])
    @Get("/posts")
    all(): Promise<Post[]> {
        return this.postService.findAll();
    }

    @Get("/posts/:id")
    one(@Param("id") id: number): Post {
        return this.postService.findOne(id);
    }

    @HttpPost("/posts")
    post(@Body() post: Post): Post {
        return this.postService.save(post);
    }

    @Delete("/posts/:id")
    delete(@Param("id") id: number): Post {
        return this.postService.remove(id);
    }

}
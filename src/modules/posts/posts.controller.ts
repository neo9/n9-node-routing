import { N9Error } from '@neo9/n9-node-utils';
import { Body, Delete, Get, JsonController, Param, Post as HttpPost } from "routing-controllers";
import { Service } from "typedi";
import { Acl } from '../../decorators/acl.decorator';
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
	    //throw new N9Error('can\'t connect', 503);
	    return this.postService.save(post);
    }

    @Delete("/posts/:id")
    delete(@Param("id") id: number): Post {
        return this.postService.remove(id);
    }

}